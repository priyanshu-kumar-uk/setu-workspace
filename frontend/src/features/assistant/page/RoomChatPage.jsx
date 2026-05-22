import React, { useEffect } from "react";
import ChatArea from "../components/ChatArea";
import { useChat } from "../hooks/useChat";
import "./RoomChatPage.css";

/**
 * Room AI — ephemeral/session-based chat.
 * No sidebar, no DB, no history persistence.
 * All messages destroyed on unmount / page refresh.
 */
const RoomChatPage = () => {
    const {
        messages,
        isStreaming,
        activeTool,
        sendMessage,
        stopGenerating,
        retryLastMessage,
        clearMessages,
    } = useChat({ mode: "room" });

    // Cleanup on unmount — guarantee no data leaks
    useEffect(() => {
        return () => { clearMessages(); };
    }, [clearMessages]);

    return (
        <div className="room-chat-layout">
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

export default RoomChatPage;
