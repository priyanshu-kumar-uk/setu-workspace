import React, { useRef, useEffect } from "react";
import { SendHorizonal, Square } from "lucide-react";
import "./ChatInput.css";

const ChatInput = ({ onSend, isStreaming, onStop }) => {
    const textareaRef = useRef(null);

    // Auto-resize textarea
    const adjustHeight = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 200) + "px";
    };

    const handleSubmit = () => {
        const el = textareaRef.current;
        if (!el) return;
        const text = el.value.trim();
        if (!text || isStreaming) return;
        onSend(text);
        el.value = "";
        el.style.height = "auto";
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // Focus on mount
    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    return (
        <div className="chat-input-container">
            <div className="chat-input-wrap">
                <textarea
                    ref={textareaRef}
                    className="chat-input-textarea"
                    placeholder="Ask anything"
                    rows={1}
                    onInput={adjustHeight}
                    onKeyDown={handleKeyDown}
                    disabled={isStreaming}
                    id="chat-input-field"
                />
                {isStreaming ? (
                    <button
                        className="chat-input-stop-btn"
                        onClick={onStop}
                        title="Stop generating"
                        type="button"
                        id="chat-stop-btn"
                    >
                        <Square size={16} />
                    </button>
                ) : (
                    <button
                        className="chat-input-send-btn"
                        onClick={handleSubmit}
                        title="Send message"
                        type="button"
                        id="chat-send-btn"
                    >
                        <SendHorizonal size={18} />
                    </button>
                )}
            </div>
            <p className="chat-input-disclaimer">
                Setu AI can make mistakes. Verify important information.
            </p>
        </div>
    );
};

export default ChatInput;
