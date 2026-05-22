import React, { useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import ChatSidebar from "../components/ChatSidebar";
import ChatArea from "../components/ChatArea";
import { useChat } from "../hooks/useChat";
import { useChatHistory, useDeleteChat, useRenameChat } from "../hooks/useChatHistory";
import { useChatMessages } from "../hooks/useChatMessages";
import "./AssistantPage.css";
import { useState } from "react";

const AssistantPage = () => {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Chat history for sidebar
    const { data: chats = [], refetch: refetchChats } = useChatHistory();
    const deleteChatMutation = useDeleteChat();
    const renameChatMutation = useRenameChat();

    // Load messages for existing chat
    const { data: existingMessages } = useChatMessages(chatId);

    // Chat hook
    const onChatCreated = useCallback((newChatId) => {
        navigate(`/dashboard/assistant/${newChatId}`, { replace: true });
        refetchChats();
    }, [navigate, refetchChats]);

    const onTitleUpdate = useCallback(() => {
        refetchChats();
    }, [refetchChats]);

    const {
        messages,
        isStreaming,
        activeTool,
        sendMessage,
        stopGenerating,
        retryLastMessage,
        loadMessages,
    } = useChat({
        mode: "dashboard",
        chatId: chatId || null,
        onChatCreated,
        onTitleUpdate,
    });

    // Load existing messages when chatId changes
    useEffect(() => {
        if (existingMessages && existingMessages.length > 0) {
            loadMessages(existingMessages);
        } else if (!chatId) {
            loadMessages([]);
        }
    }, [existingMessages, chatId, loadMessages]);

    // Handlers
    const handleNewChat = () => {
        navigate("/dashboard/assistant");
        loadMessages([]);
    };

    const handleSelectChat = (id) => {
        if (id === chatId) return;
        navigate(`/dashboard/assistant/${id}`);
    };

    const handleDeleteChat = (id) => {
        deleteChatMutation.mutate(id, {
            onSuccess: () => {
                if (id === chatId) {
                    navigate("/dashboard/assistant");
                    loadMessages([]);
                }
            },
        });
    };

    const handleRenameChat = (id, title) => {
        renameChatMutation.mutate({ chatId: id, title });
    };

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="assistant-layout">
            {isSidebarOpen ? (
                <ChatSidebar
                    chats={chats}
                    activeChatId={chatId}
                    onNewChat={handleNewChat}
                    onSelectChat={handleSelectChat}
                    onDeleteChat={handleDeleteChat}
                    onRenameChat={handleRenameChat}
                    onClose={() => setIsSidebarOpen(false)}
                />
            ) : (
                <button 
                    className="sidebar-open-btn" 
                    onClick={() => setIsSidebarOpen(true)}
                    title="Open sidebar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/></svg>
                </button>
            )}
            <ChatArea
                messages={messages}
                isStreaming={isStreaming}
                activeTool={activeTool}
                onSend={sendMessage}
                onStop={stopGenerating}
                onRetry={retryLastMessage}
            />
        </div>
    );
};

export default AssistantPage;
