import React, { useRef, useEffect } from 'react'
import { FileText, Plus, PanelLeftClose, PanelLeftOpen, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useAllDocs, useCreateDoc } from '../hooks/useDocs'
import SaveStatus from './SaveStatus'
import './DocsSidebar.css'
const DocsSidebar = ({ isCollapsed, setIsCollapsed, title, onTitleChange, onTitleBlur, saveStatus }) => {
    const navigate = useNavigate()
    const { id: activeDocId } = useParams()
    const { data: docsRes, isLoading } = useAllDocs()
    const createDocMutation = useCreateDoc()
    const titleInputRef = useRef(null)
    const lastFocusedId = useRef(null)
    useEffect(() => {
        if (title === 'Untitled Document' && activeDocId !== lastFocusedId.current) {
            if (titleInputRef.current) {
                titleInputRef.current.focus()
                titleInputRef.current.select()
                lastFocusedId.current = activeDocId
            }
        }
    }, [activeDocId, title])
    const docs = docsRes || []
    const handleCreate = () => {
        createDocMutation.mutate(undefined, {
            onSuccess: (res) => {
                navigate(`/docs/${res.data._id}`)
            }
        })
    }
    return (
        <motion.div
            className="docs-sidebar"
            initial={false}
            animate={{ width: isCollapsed ? 72 : 260 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="docs-sidebar-topbar">
                <div className="docs-sidebar-topbar-actions">
                    <button className="docs-sidebar-action-btn" onClick={() => navigate('/dashboard/notes')} title="Back to Dashboard">
                        <ArrowLeft size={18} />
                    </button>
                    {!isCollapsed && <SaveStatus status={saveStatus} />}
                    <button
                        className="docs-sidebar-action-btn"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                    </button>
                </div>
                {!isCollapsed && (
                    <div className="docs-sidebar-title-container">
                        <input
                            type="text"
                            ref={titleInputRef}
                            className="docs-sidebar-title-input"
                            value={title}
                            onChange={onTitleChange}
                            onBlur={onTitleBlur}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.target.blur() 
                                }
                            }}
                            placeholder="Untitled Document"
                        />
                    </div>
                )}
            </div>
            <div className="docs-sidebar-actions">
                <button
                    className={`docs-sidebar-create-btn ${isCollapsed ? 'collapsed' : ''}`}
                    onClick={handleCreate}
                    title="Create new document"
                    disabled={createDocMutation.isPending}
                >
                    <Plus size={18} />
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                            >
                                New Document
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
            <div className="docs-sidebar-content">
                {!isCollapsed && (
                    <div className="docs-sidebar-section-title">
                        Recent Documents
                    </div>
                )}
                {isLoading ? (
                    <div className="docs-sidebar-loading">
                        {isCollapsed ? "..." : "Loading..."}
                    </div>
                ) : (
                    <div className="docs-sidebar-list">
                        {docs.map(doc => {
                            const isActive = doc._id === activeDocId
                            return (
                                <button
                                    key={doc._id}
                                    className={`docs-sidebar-item ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
                                    onClick={() => navigate(`/docs/${doc._id}`)}
                                    title={isActive ? (title || 'Untitled Document') : (doc.title || 'Untitled Document')}
                                >
                                    <FileText size={16} className="docs-sidebar-item-icon" />
                                    {!isCollapsed && (
                                        <span className="docs-sidebar-item-title">
                                            {isActive ? (title || 'Untitled Document') : (doc.title || 'Untitled Document')}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                        {docs.length === 0 && !isCollapsed && (
                            <div className="docs-sidebar-empty">
                                No documents yet
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    )
}
export default DocsSidebar
