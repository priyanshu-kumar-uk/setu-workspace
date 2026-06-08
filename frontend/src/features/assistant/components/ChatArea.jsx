import React, { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import ToolIndicator from "./ToolIndicator";
import ChatInput from "./ChatInput";
import WelcomeScreen from "./WelcomeScreen";
import TypingIndicator from "../../../components/ui/Loaders/TypingIndicator";
import "./ChatArea.css";
const ChatArea = ({ messages, isStreaming, activeTool, onSend, onStop, onRetry }) => {
    const scrollRef = useRef(null);
    const bottomRef = useRef(null);
    const isAutoScrollPaused = useRef(false);
    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        isAutoScrollPaused.current = scrollHeight - scrollTop - clientHeight > 50;
    };
    useEffect(() => {
        if (!scrollRef.current || !bottomRef.current) return;
        if (!isAutoScrollPaused.current || !isStreaming) {
            bottomRef.current.scrollIntoView({ behavior: isStreaming ? "auto" : "smooth" });
        }
    }, [messages, isStreaming, activeTool]);
    const hasMessages = messages.length > 0;
    return (
        <div className="chat-area">
            {hasMessages ? (
                <div className="chat-messages-scroll" ref={scrollRef} onScroll={handleScroll}>
                    <div className="chat-messages-inner">
                        {messages.map((msg) => (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                onRetry={msg.error?.recoverable ? onRetry : undefined}
                            />
                        ))}
                        {}
                        {activeTool ? (
                            <div className="chat-tool-row">
                                <ToolIndicator tool={activeTool} />
                            </div>
                        ) : isStreaming && messages.length > 0 && messages[messages.length - 1].role === 'user' ? (
                            <div className="chat-tool-row" style={{ marginTop: '12px' }}>
                                <TypingIndicator />
                            </div>
                        ) : null}
                        <div ref={bottomRef} />
                    </div>
                </div>
            ) : (
                <WelcomeScreen onSuggestionClick={onSend} />
            )}
            <ChatInput onSend={onSend} isStreaming={isStreaming} onStop={onStop} />
        </div>
    );
};
export default ChatArea;
