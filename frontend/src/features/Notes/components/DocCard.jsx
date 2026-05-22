import React, { useState } from 'react'
import { FileText, Trash2, AlertTriangle } from 'lucide-react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import './DocCard.css'

function formatDate(dateStr) {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const DocCard = ({ doc, onOpen, onDelete }) => {
    const [showConfirm, setShowConfirm] = useState(false)

    const handleDeleteClick = (e) => {
        e.stopPropagation()
        setShowConfirm(true)
    }

    const confirmDelete = (e) => {
        e.stopPropagation()
        onDelete(doc._id)
        setShowConfirm(false)
    }

    const cancelDelete = (e) => {
        e.stopPropagation()
        setShowConfirm(false)
    }

    return (
        <>
        <motion.div
            className="doc-card"
            onClick={() => onOpen(doc._id)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            whileHover={{ y: -2 }}
        >
            <div className="doc-card-icon-wrap">
                <FileText size={22} className="doc-card-icon" />
            </div>
            <div className="doc-card-content">
                <p className="doc-card-title">{doc.title || 'Untitled Document'}</p>
                <div className="doc-card-meta">
                    <span className="doc-card-updated">Edited {formatDate(doc.updatedAt)}</span>
                    <span className="doc-card-dot">·</span>
                    <span className="doc-card-created">
                        {new Date(doc.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </span>
                </div>
            </div>
            <button
                className="doc-card-delete-btn"
                onClick={handleDeleteClick}
                title="Delete document"
            >
                <Trash2 size={15} />
            </button>
        </motion.div>

        <AnimatePresence>
            {showConfirm && (
                <div className="doc-card-confirm-overlay" onClick={cancelDelete}>
                    <motion.div 
                        className="doc-card-confirm-modal"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="doc-confirm-header">
                            <AlertTriangle size={24} color="#EF4444" />
                            <h3>Delete Document?</h3>
                        </div>
                        <p>Are you sure you want to delete "{doc.title || 'Untitled Document'}"? This action cannot be undone.</p>
                        <div className="doc-confirm-actions">
                            <button className="doc-confirm-cancel" onClick={cancelDelete}>Cancel</button>
                            <button className="doc-confirm-delete" onClick={confirmDelete}>Delete</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
        </>
    )
}

export default DocCard
