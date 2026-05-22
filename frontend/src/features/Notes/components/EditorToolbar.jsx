import React, { useState } from 'react'
import {
    Bold, Italic, Underline, Strikethrough,
    AlignLeft, AlignCenter, AlignRight,
    List, ListOrdered, CheckSquare,
    Link as LinkIcon, Image as ImageIcon,
    Heading1, Heading2, Heading3
} from 'lucide-react'
import './EditorToolbar.css'

const EditorToolbar = ({ editor }) => {
    const [showImageToast, setShowImageToast] = useState(false)

    if (!editor) return null

    const handleImageClick = () => {
        // Placeholder for future image upload
        setShowImageToast(true)
        setTimeout(() => setShowImageToast(false), 3000)
    }

    return (
        <div className="editor-toolbar">
            <div className="toolbar-group">
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
                    title="Heading 1"
                >
                    <Heading1 size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
                    title="Heading 2"
                >
                    <Heading2 size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
                    title="Heading 3"
                >
                    <Heading3 size={16} />
                </button>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
                    title="Bold"
                >
                    <Bold size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
                    title="Italic"
                >
                    <Italic size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`toolbar-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
                    title="Underline"
                >
                    <Underline size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`toolbar-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
                    title="Strikethrough"
                >
                    <Strikethrough size={16} />
                </button>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
                    title="Align Left"
                >
                    <AlignLeft size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
                    title="Align Center"
                >
                    <AlignCenter size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
                    title="Align Right"
                >
                    <AlignRight size={16} />
                </button>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
                    title="Bullet List"
                >
                    <List size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`toolbar-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
                    title="Ordered List"
                >
                    <ListOrdered size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    className={`toolbar-btn ${editor.isActive('taskList') ? 'is-active' : ''}`}
                    title="Task List"
                >
                    <CheckSquare size={16} />
                </button>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <button
                    onClick={() => {
                        const previousUrl = editor.getAttributes('link').href
                        const url = window.prompt('URL', previousUrl)
                        if (url === null) return
                        if (url === '') {
                            editor.chain().focus().extendMarkRange('link').unsetLink().run()
                            return
                        }
                        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
                    }}
                    className={`toolbar-btn ${editor.isActive('link') ? 'is-active' : ''}`}
                    title="Link"
                >
                    <LinkIcon size={16} />
                </button>
                
                <div className="image-btn-container">
                    <button
                        onClick={handleImageClick}
                        className="toolbar-btn image-placeholder-btn"
                        title="Image upload coming soon"
                    >
                        <ImageIcon size={16} />
                    </button>
                    {showImageToast && (
                        <div className="image-toast">
                            Image upload feature will be available soon
                        </div>
                    )}
                </div>
            </div>
            
            <div className="toolbar-divider" />
            
            <div className="toolbar-group">
                <input
                    type="color"
                    onInput={event => editor.chain().focus().setColor(event.target.value).run()}
                    value={editor.getAttributes('textStyle').color || '#000000'}
                    className="toolbar-color-picker"
                    title="Text Color"
                />
                <button
                     onClick={() => editor.chain().focus().toggleHighlight().run()}
                     className={`toolbar-btn ${editor.isActive('highlight') ? 'is-active' : ''}`}
                     title="Highlight"
                >
                    <div style={{width: 14, height: 14, background: '#FEF08A', borderRadius: 2, border: '1px solid #EAB308'}}></div>
                </button>
            </div>
        </div>
    )
}

export default EditorToolbar
