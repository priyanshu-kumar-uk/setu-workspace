import React, { useEffect } from "react";
import ChatArea from "../components/ChatArea";
import { useChat } from "../hooks/useChat";
import "./RoomChatPage.css";
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
