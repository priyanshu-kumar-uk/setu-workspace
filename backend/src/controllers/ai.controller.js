import { prepareDashboardContext, saveDashboardResponse,prepareRoomContext,getChatHistory,getChatMessages,deleteChat,updateChatTitle,} from "../services/ai.services.js";
import { streamWithTools } from "../providers/ai.provider.js";
import { asyncHandler } from "../utils/asynchandlar.js";
import { ApiResponse } from "../utils/api.res.js";
import { ApiError } from "../utils/api.error.js";
export const handleChatStream = async function (req, res) {
    const { message, chatId, history } = req.body;
    const mode = req.body.mode || "dashboard";
    const requestId = req.body.requestId || "req_" + Date.now();
    const userId = req.user?.id;
    if (!message) {
        return res.status(400).json({ success: false, message: "Message is required" });
    }
    try {
        let langchainMessages;
        let chat = null;
        let isNewChat = false;
        if (mode === "room") {
            langchainMessages = prepareRoomContext(history || [], message);
        } else {
            const prepared = await prepareDashboardContext(userId, chatId || null, message);
            langchainMessages = prepared.langchainMessages;
            chat = prepared.chat;
            isNewChat = prepared.isNewChat;
        }
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();
        if (chat) {
            res.write(`data: ${JSON.stringify({ type: "meta", requestId, chatId: chat._id.toString(), title: chat.title, isNew: isNewChat })}\n\n`);
        }
        let fullResponse = "";
        const stream = await streamWithTools(langchainMessages, {
            onToken: (text) => {
                fullResponse += text;
                res.write(`data: ${JSON.stringify({ type: "token", requestId, content: text })}\n\n`);
            },
            onToolStart: (tool, input) => {
                res.write(`data: ${JSON.stringify({ type: "tool_start", requestId, tool, input: JSON.stringify(input) })}\n\n`);
            },
            onToolEnd: (tool) => {
                res.write(`data: ${JSON.stringify({ type: "tool_end", requestId, tool })}\n\n`);
            },
            onError: (message, recoverable) => {
                res.write(`data: ${JSON.stringify({ type: "error", requestId, message, recoverable })}\n\n`);
            },
        }, null); 
        if (mode !== "room" && chat) {
            saveDashboardResponse(chat._id, fullResponse); 
        }
        res.write(`data: ${JSON.stringify({ type: "done", requestId })}\n\n`);
        res.end();
    } catch (error) {
        console.error("[SSE] Error:", error.message || error);
        const is429 =
            error.statusCode === 429 ||
            error.status === 429 ||
            error.message?.toLowerCase().includes("capacity exceeded") ||
            error.message?.toLowerCase().includes("rate limit") ||
            error.message?.toLowerCase().includes("busy");
        if (!res.headersSent) {
            const statusCode = is429 ? 429 : 500;
            const message = is429
                ? "The AI service is currently busy. Please wait a moment and try again."
                : (error.message || "Stream failed");
            return res.status(statusCode).json({ success: false, message });
        } else {
            res.write(`data: ${JSON.stringify({ type: "error", requestId, message: error.message || "Stream interrupted", recoverable: is429 })}\n\n`);
            res.end();
        }
    }
};
export const getChats = asyncHandler(async function (req, res) {
    const userId = req.user?.id;
    const chats = await getChatHistory(userId);
    res.status(200).json(new ApiResponse(200, chats, "Chats fetched"));
});
export const getChatMsgs = asyncHandler(async function (req, res) {
    const userId = req.user?.id;
    const { chatId } = req.params;
    const messages = await getChatMessages(userId, chatId);
    res.status(200).json(new ApiResponse(200, messages, "Messages fetched"));
});
export const removeChatCtrl = asyncHandler(async function (req, res) {
    const userId = req.user?.id;
    const { chatId } = req.params;
    await deleteChat(userId, chatId);
    res.status(200).json(new ApiResponse(200, null, "Chat deleted"));
});
export const renameChatCtrl = asyncHandler(async function (req, res) {
    const userId = req.user?.id;
    const { chatId } = req.params;
    const { title } = req.body;
    if (!title) throw new ApiError(400, "Title is required");
    const chat = await updateChatTitle(userId, chatId, title);
    res.status(200).json(new ApiResponse(200, chat, "Chat renamed"));
});
