import React from 'react'
import { BubbleMenu } from '@tiptap/react/menus'
import { Bold, Italic, Underline, Strikethrough, Link } from 'lucide-react'
import './BubbleMenuBar.css'

const BubbleMenuBar = ({ editor }) => {
    if (!editor) return null

    return (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="bubble-menu">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`bubble-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
            >
                <Bold size={15} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`bubble-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
            >
                <Italic size={15} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`bubble-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
            >
                <Underline size={15} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`bubble-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
            >
                <Strikethrough size={15} />
            </button>
            <div className="bubble-divider" />
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
                className={`bubble-btn ${editor.isActive('link') ? 'is-active' : ''}`}
            >
                <Link size={15} />
            </button>
        </BubbleMenu>
    )
}

export default BubbleMenuBar
