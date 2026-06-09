import api from "../../axiosInstance";
export async function streamChat({ message, chatId, mode, history, requestId, signal, onEvent }) {
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    const response = await fetch(`${baseUrl}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal,
        body: JSON.stringify({ message, chatId, mode, history, requestId }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                console.log("[AI] SSE stream ended");
                break;
            }
            const rawChunk = decoder.decode(value, { stream: true });
            buffer += rawChunk;
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; 
            let tokenLogCount = 0;
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith("data: ")) continue;
                try {
                    const data = JSON.parse(trimmed.slice(6));
                    if (data.requestId === requestId) {
                        if (data.type === "token") {
                            if (tokenLogCount < 5) {
                                console.log("[AI] SSE token:", data.content);
                                tokenLogCount++;
                            }
                        } else {
                            console.log("[AI] SSE event:", data.type, data);
                        }
                        onEvent(data);
                    }
                } catch {
                    console.warn("[AI] SSE parse error:", trimmed.slice(0, 100));
                }
            }
        }
    } catch (err) {
        if (err.name === "AbortError") {
            console.log("[AI] SSE aborted by user");
            return;
        }
        console.error("[AI] SSE stream error:", err);
        throw err;
    } finally {
        reader.releaseLock();
    }
}
export async function fetchChats() {
    const res = await api.get("/chats");
    return res.data;
}
export async function fetchChatMessages(chatId) {
    const res = await api.get(`/chats/${chatId}/messages`);
    return res.data;
}
export async function deleteChatApi(chatId) {
    const res = await api.delete(`/chats/${chatId}`);
    return res.data;
}
export async function updateChatTitleApi(chatId, title) {
    const res = await api.patch(`/chats/${chatId}/title`, { title });
    return res.data;
}
