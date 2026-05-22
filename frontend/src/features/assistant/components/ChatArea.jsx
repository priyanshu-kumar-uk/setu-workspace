import React, { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import ToolIndicator from "./ToolIndicator";
import ChatInput from "./ChatInput";
import WelcomeScreen from "./WelcomeScreen";
import "./ChatArea.css";

const ChatArea = ({ messages, isStreaming, activeTool, onSend, onStop, onRetry }) => {
    const scrollRef = useRef(null);
    const bottomRef = useRef(null);

    const isAutoScrollPaused = useRef(false);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        // Pause auto-scroll if user scrolls up more than 50px from the bottom
        isAutoScrollPaused.current = scrollHeight - scrollTop - clientHeight > 50;
    };

    // Smart auto-scroll: only scroll if the user hasn't manually scrolled up
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

                        {/* Tool indicator */}
                        {activeTool && (
                            <div className="chat-tool-row">
                                <ToolIndicator tool={activeTool} />
                            </div>
                        )}

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
