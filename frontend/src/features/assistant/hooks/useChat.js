import { useState, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { streamChat } from "../services/ai.api.js";

/**
 * Core chat hook — manages messages, streaming, abort, error/retry.
 * Works in both "dashboard" (persistent) and "room" (ephemeral) modes.
 *
 * @param {Object} options
 * @param {string} options.mode - "dashboard" or "room"
 * @param {string|null} options.chatId - existing chatId for dashboard
 * @param {Function} options.onChatCreated - callback when new chat is created
 * @param {Function} options.onTitleUpdate - callback when title is generated
 */
export function useChat({ mode = "dashboard", chatId = null, onChatCreated, onTitleUpdate } = {}) {
    const [messages, setMessages] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [activeTool, setActiveTool] = useState(null);
    const abortControllerRef = useRef(null);
    const currentChatIdRef = useRef(chatId);
    const messagesRef = useRef(messages);

    // Keep refs in sync
    currentChatIdRef.current = chatId;
    messagesRef.current = messages;

    // ─── Load existing messages (for dashboard) ──────────
    const loadMessages = useCallback((msgs) => {
        setMessages(
            msgs.map((m) => ({
                id: m._id || uuidv4(),
                role: m.role,
                content: m.content || "",
                isStreaming: false,
                error: null,
            }))
        );
    }, []);

    // ─── Send Message ────────────────────────────────────
    const sendMessage = useCallback(
        async (text) => {
            if (!text.trim() || isStreaming) return;

            const requestId = uuidv4();
            const userMsg = { id: uuidv4(), role: "user", content: text, isStreaming: false, error: null };

            // Optimistic: add user msg + empty assistant msg
            const assistantMsgId = uuidv4();
            const assistantMsg = {
                id: assistantMsgId,
                role: "assistant",
                content: "",
                isStreaming: true,
                error: null,
            };

            setMessages((prev) => [...prev, userMsg, assistantMsg]);
            setIsStreaming(true);
            setActiveTool(null);

            // Create abort controller
            const controller = new AbortController();
            abortControllerRef.current = controller;

            // Build history for room mode
            let history = null;
            if (mode === "room") {
                history = messagesRef.current
                    .filter((m) => m.role === "user" || m.role === "assistant")
                    .map((m) => ({ role: m.role, content: m.content }));
            }

            try {
                await streamChat({
                    message: text,
                    chatId: currentChatIdRef.current,
                    mode,
                    history,
                    requestId,
                    signal: controller.signal,
                    onEvent: (event) => {
                        switch (event.type) {
                            case "token":
                                setMessages((prev) => {
                                    const exists = prev.some((m) => m.id === assistantMsgId);
                                    if (!exists) {
                                        // The message was wiped by `loadMessages` (React Query fetching the new chat).
                                        // Re-append the streaming assistant message to the end.
                                        return [
                                            ...prev,
                                            {
                                                id: assistantMsgId,
                                                role: "assistant",
                                                content: event.content,
                                                isStreaming: true,
                                                error: null,
                                            },
                                        ];
                                    }
                                    return prev.map((m) =>
                                        m.id === assistantMsgId
                                            ? { ...m, content: m.content + event.content }
                                            : m
                                    );
                                });
                                break;

                            case "tool_start":
                                setActiveTool({ name: event.tool, input: event.input });
                                break;

                            case "tool_end":
                                setActiveTool(null);
                                break;

                            case "meta":
                                if (event.chatId && !currentChatIdRef.current) {
                                    currentChatIdRef.current = event.chatId;
                                    onChatCreated?.(event.chatId);
                                }
                                if (event.title && event.title !== "New Chat") {
                                    onTitleUpdate?.(event.chatId, event.title);
                                }
                                break;

                            case "error":
                                setMessages((prev) =>
                                    prev.map((m) =>
                                        m.id === assistantMsgId
                                            ? {
                                                  ...m,
                                                  isStreaming: false,
                                                  error: {
                                                      message: event.message,
                                                      recoverable: event.recoverable,
                                                  },
                                              }
                                            : m
                                    )
                                );
                                break;

                            case "done":
                                // Mark streaming complete
                                setMessages((prev) =>
                                    prev.map((m) =>
                                        m.id === assistantMsgId ? { ...m, isStreaming: false } : m
                                    )
                                );
                                break;
                        }
                    },
                });

                // Ensure streaming flag is cleared
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantMsgId ? { ...m, isStreaming: false } : m
                    )
                );
            } catch (err) {
                if (err.name === "AbortError") {
                    // User cancelled — mark as complete with what we have
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === assistantMsgId ? { ...m, isStreaming: false } : m
                        )
                    );
                } else {
                    // Real error
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === assistantMsgId
                                ? {
                                      ...m,
                                      isStreaming: false,
                                      error: { message: err.message, recoverable: true },
                                  }
                                : m
                        )
                    );
                }
            } finally {
                setIsStreaming(false);
                setActiveTool(null);
                abortControllerRef.current = null;
            }
        },
        [mode, isStreaming, onChatCreated, onTitleUpdate]
    );

    // ─── Stop Generating ─────────────────────────────────
    const stopGenerating = useCallback(() => {
        abortControllerRef.current?.abort();
    }, []);

    // ─── Retry Last Message ──────────────────────────────
    const retryLastMessage = useCallback(() => {
        // Find last user message
        const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
        if (!lastUserMsg) return;

        // Remove the failed assistant message
        setMessages((prev) => {
            const lastAssistantIdx = prev.findLastIndex((m) => m.role === "assistant");
            if (lastAssistantIdx !== -1) {
                return prev.filter((_, i) => i !== lastAssistantIdx);
            }
            return prev;
        });

        // Also remove last user message to re-add it
        setMessages((prev) => {
            const lastUserIdx = prev.findLastIndex((m) => m.role === "user");
            if (lastUserIdx !== -1) {
                return prev.filter((_, i) => i !== lastUserIdx);
            }
            return prev;
        });

        // Re-send
        setTimeout(() => sendMessage(lastUserMsg.content), 50);
    }, [messages, sendMessage]);

    // ─── Clear Messages (for room mode) ──────────────────
    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    return {
        messages,
        isStreaming,
        activeTool,
        sendMessage,
        stopGenerating,
        retryLastMessage,
        loadMessages,
        clearMessages,
    };
}
