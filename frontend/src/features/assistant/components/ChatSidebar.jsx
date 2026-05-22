import React, { useState } from "react";
import { MessageSquare, Trash2, Pencil, Check, X, PanelLeftClose, SquarePen } from "lucide-react";
import "./ChatSidebar.css";

const ChatSidebar = ({ chats = [], activeChatId, onNewChat, onSelectChat, onDeleteChat, onRenameChat, onClose }) => {
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");

    const handleStartRename = (e, chat) => {
        e.stopPropagation();
        setEditingId(chat._id);
        setEditTitle(chat.title);
    };

    const handleConfirmRename = (e, chatId) => {
        e.stopPropagation();
        if (editTitle.trim()) {
            onRenameChat?.(chatId, editTitle.trim());
        }
        setEditingId(null);
    };

    const handleCancelRename = (e) => {
        e.stopPropagation();
        setEditingId(null);
    };

    // Group chats by relative date
    const groupChats = (chatList) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 86400000);
        const weekAgo = new Date(today.getTime() - 7 * 86400000);

        const groups = { Today: [], Yesterday: [], "Previous 7 Days": [], Older: [] };

        for (const chat of chatList) {
            const d = new Date(chat.updatedAt || chat.createdAt);
            if (d >= today) groups.Today.push(chat);
            else if (d >= yesterday) groups.Yesterday.push(chat);
            else if (d >= weekAgo) groups["Previous 7 Days"].push(chat);
            else groups.Older.push(chat);
        }

        return Object.entries(groups).filter(([, items]) => items.length > 0);
    };

    const grouped = groupChats(chats);

    return (
        <aside className="chat-sidebar">
            <div className="chat-sidebar-header">
                <button className="chat-sidebar-icon-btn" onClick={onClose} title="Close sidebar">
                    <PanelLeftClose size={20} />
                </button>
                <div style={{ flex: 1 }}></div>
                <button className="chat-sidebar-icon-btn" onClick={onNewChat} type="button" id="new-chat-btn" title="New chat">
                    <SquarePen size={20} />
                </button>
            </div>

            <div className="chat-sidebar-list">
                {grouped.map(([label, items]) => (
                    <div key={label} className="chat-sidebar-group">
                        <span className="chat-sidebar-group-label">{label}</span>
                        {items.map((chat) => (
                            <div
                                key={chat._id}
                                className={`chat-sidebar-item ${chat._id === activeChatId ? "active" : ""}`}
                                onClick={() => onSelectChat(chat._id)}
                                role="button"
                                tabIndex={0}
                            >
                                <MessageSquare size={15} className="chat-sidebar-item-icon" />

                                {editingId === chat._id ? (
                                    <div className="chat-sidebar-edit" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="chat-sidebar-edit-input"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleConfirmRename(e, chat._id);
                                                if (e.key === "Escape") handleCancelRename(e);
                                            }}
                                        />
                                        <button className="chat-sidebar-edit-btn" onClick={(e) => handleConfirmRename(e, chat._id)}>
                                            <Check size={13} />
                                        </button>
                                        <button className="chat-sidebar-edit-btn" onClick={handleCancelRename}>
                                            <X size={13} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="chat-sidebar-item-title">{chat.title}</span>
                                        <div className="chat-sidebar-item-actions">
                                            <button
                                                className="chat-sidebar-action-btn"
                                                onClick={(e) => handleStartRename(e, chat)}
                                                title="Rename"
                                            >
                                                <Pencil size={13} />
                                            </button>
                                            <button
                                                className="chat-sidebar-action-btn chat-sidebar-delete-btn"
                                                onClick={(e) => { e.stopPropagation(); onDeleteChat?.(chat._id); }}
                                                title="Delete"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ))}

                {chats.length === 0 && (
                    <p className="chat-sidebar-empty">No conversations yet</p>
                )}
            </div>
        </aside>
    );
};

export default ChatSidebar;
