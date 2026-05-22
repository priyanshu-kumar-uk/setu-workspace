import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useDragControls, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Heading from '@tiptap/extension-heading';
import { X, Minus, Maximize2, Plus, FileText, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { useDoc, useAllDocs, useCreateDoc } from '../Notes/hooks/useDocs';
import { useAutosave } from '../Notes/hooks/useAutosave';
import EditorToolbar from '../Notes/components/EditorToolbar';
import BubbleMenuBar from '../Notes/components/BubbleMenuBar';
import SaveStatus from '../Notes/components/SaveStatus';
import './RoomDocsOverlay.css';

const DEFAULT_W = 900;
const DEFAULT_H = 580;
const MIN_W     = 560;
const MIN_H     = 360;

const RoomDocsOverlay = ({ roomId, onClose }) => {
    const dragControls = useDragControls();

    // ── Window ────────────────────────────────────────────────────────
    const [size, setSize]           = useState({ width: DEFAULT_W, height: DEFAULT_H });
    const resizeStartRef            = useRef(null);
    const [isMinimized, setIsMinimized]           = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // ── Active doc ────────────────────────────────────────────────────
    const sessionKey = roomId ? `setu-room-doc-${roomId}` : null;
    const [activeDocId, setActiveDocId] = useState(() =>
        sessionKey ? (sessionStorage.getItem(sessionKey) || null) : null
    );
    useEffect(() => {
        if (sessionKey && activeDocId) sessionStorage.setItem(sessionKey, activeDocId);
    }, [activeDocId, sessionKey]);

    // ── Doc list ──────────────────────────────────────────────────────
    const { data: allDocs = [], isLoading: docsLoading, refetch: refetchAll } = useAllDocs();
    // Force fresh fetch whenever the overlay mounts (busts 2-min stale cache)
    useEffect(() => { refetchAll(); }, []); // eslint-disable-line

    const createDocMutation = useCreateDoc();
    const handleCreateDoc = () =>
        createDocMutation.mutate(undefined, {
            onSuccess: (res) => setActiveDocId(res.data._id),
        });

    // ── Single-doc fetch (staleTime:0 → always fresh) ─────────────────
    const { data: docData, isLoading: docLoading } = useDoc(activeDocId);

    // ── Autosave refs ─────────────────────────────────────────────────
    const { status: saveStatus, triggerSave }      = useAutosave(activeDocId, 1500);
    const { triggerSave: triggerTitleSave }         = useAutosave(activeDocId, 800);

    // Always-current ref so the editor onUpdate closure never goes stale
    const triggerSaveRef = useRef(triggerSave);
    useEffect(() => { triggerSaveRef.current = triggerSave; }, [triggerSave]);

    // ── Hydration tracking ────────────────────────────────────────────
    // `loadedDocIdRef` records WHICH docId is currently rendered in the editor.
    // Compared against `activeDocId` to decide reset vs. hydrate.
    // This ref approach eliminates the need to add `editor` to effect deps.
    const loadedDocIdRef = useRef(null);
    // `canSaveRef` gates onUpdate so autosave never fires during hydration.
    const canSaveRef     = useRef(false);
    // Stable ref to the editor — keeps effects from listing `editor` as a dep.
    const editorRef      = useRef(null);

    // ── Tiptap ───────────────────────────────────────────────────────
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Strike,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Link.configure({ openOnClick: false }),
            Image,
            Placeholder.configure({ placeholder: 'Start writing…' }),
            TaskList,
            TaskItem.configure({ nested: true }),
            TextStyle,
            Color,
            Highlight,
            Heading.configure({ levels: [1, 2, 3] }),
        ],
        content: null,
        // Closure only touches refs — never stale
        onUpdate: ({ editor: ed }) => {
            if (canSaveRef.current) triggerSaveRef.current({ contentJSON: ed.getJSON() });
        },
    });

    // Keep editorRef in sync — single stable subscription
    useEffect(() => { editorRef.current = editor; }, [editor]);

    // ── Title ─────────────────────────────────────────────────────────
    const [title, setTitle] = useState('Untitled Document');

    // ── Effect A — Reset editor when user picks a different document ───
    // Dep: [activeDocId] only. We read editorRef.current instead of `editor`
    // to avoid the effect re-firing on unrelated editor identity changes.
    useEffect(() => {
        // Already showing this doc — nothing to reset
        if (loadedDocIdRef.current === activeDocId) return;

        canSaveRef.current   = false;
        loadedDocIdRef.current = null; // mark as "not yet loaded"
        setTitle('Untitled Document');

        const ed = editorRef.current;
        if (ed && !ed.isDestroyed) ed.commands.setContent('', false);
    }, [activeDocId]);

    // ── Effect B — Hydrate editor once fresh docData lands ────────────
    // Dep: [docData, activeDocId] only.  
    // `editorRef.current` is used in place of `editor` to avoid making
    // this effect re-run on editor identity changes (which happen on
    // every unrelated state update inside this component).
    useEffect(() => {
        // Nothing to load yet
        if (!docData || !activeDocId) return;
        // Already loaded exactly this doc
        if (loadedDocIdRef.current === activeDocId) return;

        const ed = editorRef.current;
        if (!ed || ed.isDestroyed) return;

        // Load content — false = no onUpdate event (prevents spurious autosave)
        ed.commands.setContent(docData.contentJSON || '', false);
        setTitle(docData.title || 'Untitled Document');

        loadedDocIdRef.current = activeDocId; // mark as loaded
        canSaveRef.current     = true;         // unlock autosave
    }, [docData, activeDocId]);

    // ── Title handlers ────────────────────────────────────────────────
    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        triggerTitleSave({ title: e.target.value });
    };
    const handleTitleBlur = () => {
        if (!title.trim()) {
            setTitle('Untitled Document');
            triggerTitleSave({ title: 'Untitled Document' });
        }
    };

    // ── SE Resize ─────────────────────────────────────────────────────
    const handleResizeStart = useCallback((e) => {
        e.preventDefault(); e.stopPropagation();
        resizeStartRef.current = { startX: e.clientX, startY: e.clientY, startW: size.width, startH: size.height };
        const onMove = (ev) => {
            if (!resizeStartRef.current) return;
            const { startX, startY, startW, startH } = resizeStartRef.current;
            setSize({
                width:  Math.max(MIN_W, startW + ev.clientX - startX),
                height: Math.max(MIN_H, startH + ev.clientY - startY),
            });
        };
        const onUp = () => {
            resizeStartRef.current = null;
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    }, [size]);

    // ── Render ────────────────────────────────────────────────────────
    return (
        <motion.div
            className="rd-docs-overlay"
            style={{ width: size.width, height: isMinimized ? 44 : size.height }}
            drag dragControls={dragControls} dragListener={false}
            dragMomentum={false} dragElastic={0}
            initial={{ opacity: 0, scale: 0.97, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        >
            {/* ── Title bar ── */}
            <div className="rd-docs-titlebar" onPointerDown={(e) => dragControls.start(e)}>
                <div className="rd-docs-titlebar-left">
                    <span className="rd-docs-titlebar-icon"><FileText size={13} /></span>
                    <input
                        type="text" className="rd-docs-title-input"
                        value={title} onChange={handleTitleChange} onBlur={handleTitleBlur}
                        onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                        placeholder="Untitled Document"
                        onPointerDown={(e) => e.stopPropagation()}
                    />
                    <div onPointerDown={(e) => e.stopPropagation()}>
                        <SaveStatus status={saveStatus} />
                    </div>
                </div>
                <div className="rd-docs-titlebar-right" onPointerDown={(e) => e.stopPropagation()}>
                    <button className="rd-docs-ctrl-btn" onClick={() => setIsMinimized(v => !v)}
                        title={isMinimized ? 'Restore' : 'Minimize'}>
                        {isMinimized ? <Maximize2 size={12} /> : <Minus size={12} />}
                    </button>
                    <button className="rd-docs-ctrl-btn rd-docs-close-btn" onClick={onClose} title="Close">
                        <X size={12} />
                    </button>
                </div>
            </div>

            {/* ── Body ── */}
            <AnimatePresence>
                {!isMinimized && (
                    <motion.div className="rd-docs-body"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}>

                        {/* ── Sidebar ── */}
                        <div
                            className={`rd-docs-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <div className="rd-docs-sidebar-header">
                                <button className="rd-docs-sidebar-btn" onClick={handleCreateDoc}
                                    disabled={createDocMutation.isPending} title="New Document">
                                    <Plus size={14} />
                                    {!isSidebarCollapsed && <span>New Doc</span>}
                                </button>
                                <button className="rd-docs-sidebar-icon-btn"
                                    onClick={() => setIsSidebarCollapsed(v => !v)}
                                    title={isSidebarCollapsed ? 'Expand' : 'Collapse'}>
                                    {isSidebarCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
                                </button>
                            </div>

                            {!isSidebarCollapsed && <div className="rd-docs-sidebar-label">Documents</div>}

                            <div className="rd-docs-sidebar-list">
                                {docsLoading ? (
                                    <div className="rd-docs-sidebar-empty">Loading…</div>
                                ) : allDocs.length === 0 ? (
                                    <div className="rd-docs-sidebar-empty">No documents yet</div>
                                ) : allDocs.map(doc => (
                                    <button key={doc._id}
                                        className={`rd-docs-sidebar-item ${doc._id === activeDocId ? 'active' : ''} ${isSidebarCollapsed ? 'icon-only' : ''}`}
                                        onClick={() => setActiveDocId(doc._id)}
                                        title={doc.title || 'Untitled Document'}>
                                        <FileText size={14} className="rd-docs-item-icon" />
                                        {!isSidebarCollapsed && (
                                            <span className="rd-docs-item-title">
                                                {doc._id === activeDocId
                                                    ? title
                                                    : (doc.title || 'Untitled Document')}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Editor pane ── */}
                        <div className="rd-docs-editor-pane" onPointerDown={(e) => e.stopPropagation()}>
                            <div className="rd-docs-toolbar-row">
                                {editor && <EditorToolbar editor={editor} />}
                            </div>
                            <div className="rd-docs-editor-scroll">
                                {!activeDocId ? (
                                    <div className="rd-docs-no-doc">
                                        <FileText size={36} strokeWidth={1.2} />
                                        <p>Select a document or create a new one</p>
                                        <button className="rd-docs-create-cta" onClick={handleCreateDoc}
                                            disabled={createDocMutation.isPending}>
                                            <Plus size={14} /> New Document
                                        </button>
                                    </div>
                                ) : docLoading ? (
                                    <div className="rd-docs-loading">
                                        <div className="rd-docs-loading-dot" />
                                        <span>Loading…</span>
                                    </div>
                                ) : (
                                    <>
                                        {editor && <BubbleMenuBar editor={editor} />}
                                        <EditorContent editor={editor} className="rd-docs-tiptap" />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* SE resize corner */}
                        <div className="rd-docs-resize-handle" onPointerDown={handleResizeStart} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default RoomDocsOverlay;
