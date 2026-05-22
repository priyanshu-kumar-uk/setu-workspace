import React from "react";
import { RefreshCw, Copy } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import "./MessageBubble.css";

const MessageBubble = ({ message, onRetry }) => {
    const isUser = message.role === "user";
    const isAssistant = message.role === "assistant";

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
    };

    return (
        <div className={`msg-row ${isUser ? "msg-row-user" : "msg-row-assistant"}`}>
            {/* Avatar */}
            {isAssistant && (
                <div className="msg-avatar msg-avatar-ai">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 0 2h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1 0-2h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z" />
                    </svg>
                </div>
            )}

            <div className={`msg-bubble ${isUser ? "msg-bubble-user" : "msg-bubble-assistant"}`}>
                {/* Content */}
                {isUser ? (
                    <p className="msg-text-user">{message.content}</p>
                ) : (
                    <>
                        {message.content ? (
                            <MarkdownRenderer content={message.content} />
                        ) : message.isStreaming ? (
                            <span className="msg-cursor" />
                        ) : null}

                        {/* Streaming cursor */}
                        {message.isStreaming && message.content && (
                            <span className="msg-cursor" />
                        )}
                    </>
                )}

                {/* Error state */}
                {message.error && (
                    <div className="msg-error">
                        <span className="msg-error-text">
                            {message.error.message || "Failed to generate response"}
                        </span>
                        {message.error.recoverable && onRetry && (
                            <button className="msg-retry-btn" onClick={onRetry} type="button">
                                <RefreshCw size={13} />
                                Retry
                            </button>
                        )}
                    </div>
                )}

                {/* Actions (only for completed assistant messages) */}
                {isAssistant && !message.isStreaming && !message.error && message.content && (
                    <div className="msg-actions">
                        <button className="msg-action-btn" onClick={handleCopy} title="Copy" type="button">
                            <Copy size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
