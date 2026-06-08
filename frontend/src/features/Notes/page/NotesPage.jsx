import React, { useState } from 'react'
import { Plus, Settings, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAllDocs, useCreateDoc, useDeleteDoc } from '../hooks/useDocs'
import DocCard from '../components/DocCard'
import { SkeletonList } from '../../../components/ui/Skeletons/Skeleton'
import './NotesPage.css'
const NotesPage = () => {
    const navigate = useNavigate()
    const { data: response, isLoading } = useAllDocs()
    const createDocMutation = useCreateDoc()
    const deleteDocMutation = useDeleteDoc()
    const docs = response || []
    const handleCreate = () => {
        createDocMutation.mutate(undefined, {
            onSuccess: (res) => {
                const newDocId = res.data._id
                navigate(`/docs/${newDocId}`)
            }
        })
    }
    const handleOpen = (id) => {
        navigate(`/docs/${id}`)
    }
    const handleDelete = (id) => {
        deleteDocMutation.mutate(id)
    }
    return (
        <div className="docs-dashboard">
            {}
            <main className="docs-main">
                {}
                <section className="docs-create-section">
                    <div className="docs-create-container">
                        <h2 className="docs-section-title">Start a new document</h2>
                        <div className="docs-create-grid">
                            <button className="docs-create-card" onClick={handleCreate} disabled={createDocMutation.isPending}>
                                <div className="docs-create-icon-wrap">
                                    <Plus size={32} />
                                </div>
                                <span>Blank</span>
                            </button>
                        </div>
                    </div>
                </section>
                {}
                <section className="docs-recent-section">
                    <div className="docs-recent-container">
                        <h2 className="docs-section-title">Recent documents</h2>
                        {isLoading ? (
                            <div className="docs-list">
                                <SkeletonList count={3} />
                            </div>
                        ) : docs.length > 0 ? (
                            <div className="docs-list">
                                {docs.map(doc => (
                                    <DocCard 
                                        key={doc._id} 
                                        doc={doc} 
                                        onOpen={handleOpen} 
                                        onDelete={handleDelete} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="docs-empty-state">
                                <div className="docs-empty-icon">
                                    <FileText size={48} color="#D1D5DB" />
                                </div>
                                <h3>No documents yet</h3>
                                <p>Create a new document to get started</p>
                                <button className="docs-create-btn" onClick={handleCreate} disabled={createDocMutation.isPending}>
                                    <Plus size={18} />
                                    Create New Document
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    )
}
export default NotesPage
