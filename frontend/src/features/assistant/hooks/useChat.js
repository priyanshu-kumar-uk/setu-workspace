import { useState, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { streamChat } from "../services/ai.api.js";
export function useChat({ mode = "dashboard", chatId = null, onChatCreated, onTitleUpdate } = {}) {
    const [messages, setMessages] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [activeTool, setActiveTool] = useState(null);
    const abortControllerRef = useRef(null);
    const currentChatIdRef = useRef(chatId);
    const messagesRef = useRef(messages);
    currentChatIdRef.current = chatId;
    messagesRef.current = messages;
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
    const sendMessage = useCallback(
        async (text) => {
            if (!text.trim() || isStreaming) return;
            const requestId = uuidv4();
            const userMsg = { id: uuidv4(), role: "user", content: text, isStreaming: false, error: null };
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
            const controller = new AbortController();
            abortControllerRef.current = controller;
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
                                setMessages((prev) =>
                                    prev.map((m) =>
                                        m.id === assistantMsgId ? { ...m, isStreaming: false } : m
                                    )
                                );
                                break;
                        }
                    },
                });
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantMsgId ? { ...m, isStreaming: false } : m
                    )
                );
            } catch (err) {
                if (err.name === "AbortError") {
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === assistantMsgId ? { ...m, isStreaming: false } : m
                        )
                    );
                } else {
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
    const stopGenerating = useCallback(() => {
        abortControllerRef.current?.abort();
    }, []);
    const retryLastMessage = useCallback(() => {
        const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
        if (!lastUserMsg) return;
        setMessages((prev) => {
            const lastAssistantIdx = prev.findLastIndex((m) => m.role === "assistant");
            if (lastAssistantIdx !== -1) {
                return prev.filter((_, i) => i !== lastAssistantIdx);
            }
            return prev;
        });
        setMessages((prev) => {
            const lastUserIdx = prev.findLastIndex((m) => m.role === "user");
            if (lastUserIdx !== -1) {
                return prev.filter((_, i) => i !== lastUserIdx);
            }
            return prev;
        });
        setTimeout(() => sendMessage(lastUserMsg.content), 50);
    }, [messages, sendMessage]);
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
