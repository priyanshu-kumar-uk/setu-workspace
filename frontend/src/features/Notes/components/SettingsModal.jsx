import React from 'react'
import { X, Keyboard, Command } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './SettingsModal.css'
const SHORTCUTS = [
    { category: 'Text Formatting', items: [
        { keys: ['Ctrl', 'B'], label: 'Bold' },
        { keys: ['Ctrl', 'I'], label: 'Italic' },
        { keys: ['Ctrl', 'U'], label: 'Underline' },
        { keys: ['Ctrl', 'Shift', 'X'], label: 'Strikethrough' },
    ]},
    { category: 'Structure', items: [
        { keys: ['Ctrl', 'Alt', '1'], label: 'Heading 1' },
        { keys: ['Ctrl', 'Alt', '2'], label: 'Heading 2' },
        { keys: ['Ctrl', 'Alt', '3'], label: 'Heading 3' },
        { keys: ['Ctrl', 'Shift', '8'], label: 'Bullet List' },
        { keys: ['Ctrl', 'Shift', '7'], label: 'Ordered List' },
        { keys: ['Ctrl', 'Shift', '9'], label: 'Task List' },
    ]},
    { category: 'Document', items: [
        { keys: ['Ctrl', 'S'], label: 'Save (Autosave)' },
        { keys: ['Ctrl', 'Z'], label: 'Undo' },
        { keys: ['Ctrl', 'Y'], label: 'Redo' },
        { keys: ['Ctrl', 'A'], label: 'Select All' },
    ]},
    { category: 'Links & Export', items: [
        { keys: ['Ctrl', 'K'], label: 'Insert Link' },
        { keys: ['Ctrl', 'Shift', 'P'], label: 'Export PDF' },
    ]},
]
const SettingsModal = ({ onClose }) => {
    return (
        <AnimatePresence>
            <motion.div
                className="settings-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="settings-modal"
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 12 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="settings-header">
                        <div className="settings-header-left">
                            <Keyboard size={18} className="settings-header-icon" />
                            <span className="settings-title">Keyboard Shortcuts</span>
                        </div>
                        <button className="settings-close-btn" onClick={onClose}>
                            <X size={18} />
                        </button>
                    </div>
                    <div className="settings-body">
                        {SHORTCUTS.map((section) => (
                            <div key={section.category} className="shortcut-section">
                                <p className="shortcut-category">{section.category}</p>
                                {section.items.map((item) => (
                                    <div key={item.label} className="shortcut-row">
                                        <span className="shortcut-label">{item.label}</span>
                                        <div className="shortcut-keys">
                                            {item.keys.map((key, i) => (
                                                <React.Fragment key={key}>
                                                    <kbd className="shortcut-key">{key}</kbd>
                                                    {i < item.keys.length - 1 && (
                                                        <span className="shortcut-plus">+</span>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
export default SettingsModal
