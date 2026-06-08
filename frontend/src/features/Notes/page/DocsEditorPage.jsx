import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Settings } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Heading from '@tiptap/extension-heading'
import html2pdf from 'html2pdf.js'
import { useDoc } from '../hooks/useDocs'
import { useAutosave } from '../hooks/useAutosave'
import EditorToolbar from '../components/EditorToolbar'
import BubbleMenuBar from '../components/BubbleMenuBar'
import DocsSidebar from '../components/DocsSidebar'
import SettingsModal from '../components/SettingsModal'
import './DocsEditorPage.css'
const DocsEditorPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data: docRes, isLoading } = useDoc(id)
    const { status, triggerSave } = useAutosave(id, 1500)
    const { status: titleStatus, triggerSave: triggerTitleSave } = useAutosave(id, 1000)
    const doc = docRes
    const [title, setTitle] = useState('Untitled Document')
    const [isHydrated, setIsHydrated] = useState(false)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Strike,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Link.configure({ openOnClick: false }),
            Image,
            Placeholder.configure({ placeholder: 'Type / for commands, or start writing...' }),
            TaskList,
            TaskItem.configure({ nested: true }),
            TextStyle,
            Color,
            Highlight,
            Heading.configure({ levels: [1, 2, 3] }),
        ],
        content: null,
        onUpdate: ({ editor }) => {
            if (isHydrated) {
                triggerSave({ contentJSON: editor.getJSON() })
            }
        },
    })
    useEffect(() => {
        setIsHydrated(false)
        setTitle('Loading...')
        if (editor && !editor.isDestroyed) {
            editor.commands.setContent('')
        }
    }, [id, editor])
    useEffect(() => {
        if (doc && editor && !editor.isDestroyed && !isHydrated) {
            setTitle(doc.title)
            editor.commands.setContent(doc.contentJSON || '')
            setIsHydrated(true)
        }
    }, [doc, editor, isHydrated])
    const handleTitleChange = (e) => {
        setTitle(e.target.value)
        triggerTitleSave({ title: e.target.value })
    }
    const handleTitleBlur = () => {
        if (!title.trim()) {
            setTitle('Untitled Document')
            triggerTitleSave({ title: 'Untitled Document' })
        }
    }
    const exportToPDF = () => {
        if (!editor) return
        const content = editor.getHTML()
        const opt = {
            margin: 1,
            filename: `${title || 'Document'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        }
        const element = document.createElement('div')
        element.innerHTML = content
        element.style.padding = '20px'
        element.style.fontFamily = 'Inter, sans-serif'
        html2pdf().set(opt).from(element).save()
    }
    if (isLoading) {
        return (
            <div className="docs-editor-skeleton">
                <div className="skeleton-sidebar"></div>
                <div className="skeleton-main">
                    <div className="skeleton-header"></div>
                    <div className="skeleton-page"></div>
                </div>
            </div>
        )
    }
    return (
        <div className="docs-workspace-container">
            <DocsSidebar 
                isCollapsed={isSidebarCollapsed} 
                setIsCollapsed={setIsSidebarCollapsed} 
                title={title}
                onTitleChange={handleTitleChange}
                onTitleBlur={handleTitleBlur}
                saveStatus={status}
            />
            <div className="docs-editor-layout">
            <header className="docs-editor-header">
                {}
                <div className="docs-editor-header-left"></div>
                <div className="docs-editor-header-center">
                    <EditorToolbar editor={editor} />
                </div>
                <div className="docs-editor-header-right">
                    <button className="docs-export-btn" onClick={() => setIsSettingsOpen(true)} title="Settings">
                        <Settings size={16} />
                        Settings
                    </button>
                    <button className="docs-export-btn" onClick={exportToPDF} title="Export PDF">
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </header>
            <main className="docs-editor-main">
                <div className="docs-editor-page-wrapper">
                    {editor && <BubbleMenuBar editor={editor} />}
                    <EditorContent editor={editor} className="docs-tiptap-editor" />
                </div>
            </main>
        </div>
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
        </div>
    )
}
export default DocsEditorPage
