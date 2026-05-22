import chatModel from "../models/ai.chat.model.js";
import messageModel from "../models/ai.message.model.js";
import { streamWithTools, generateTitle } from "../providers/ai.provider.js";
import { buildContext } from "./ai.context.js";
import { ApiError } from "../utils/api.error.js";

export async function prepareDashboardContext(userId, chatId, message) {
    let chat;
    let isNewChat = false;

    if (chatId) {
        chat = await chatModel.findOne({ _id: chatId, userId });
        if (!chat) throw new ApiError(404, "Chat not found");
    } else {
        const title = await generateTitle(message);
        chat = await chatModel.create({ userId, type: "dashboard", title });
        isNewChat = true;
    }

    const previousMessages = await messageModel
        .find({ chatId: chat._id })
        .sort({ createdAt: 1 })
        .select("role content toolName toolCallId")
        .lean();

    // Build context with token-aware truncation
    const langchainMessages = buildContext({
        history: previousMessages,
        userMessage: message,
    });

    await messageModel.create({
        chatId: chat._id,
        role: "user",
        content: message,
    });

    return { chat, langchainMessages, isNewChat };
}

export async function saveDashboardResponse(chatId, fullResponse) {
    if (fullResponse) {
        await messageModel.create({
            chatId,
            role: "assistant",
            content: fullResponse,
        });
        await chatModel.findByIdAndUpdate(chatId, { lastMessageAt: new Date() });
    }
}

// ─── Room: Build Context Only (no DB) ────────────────────
export function prepareRoomContext(history, message) {
    return buildContext({
        history: history || [],
        userMessage: message,
    });
}

export async function getChatHistory(userId) {
    const chats = await chatModel
        .find({ userId, type: "dashboard" })
        .sort({ updatedAt: -1 })
        .select("title type lastMessageAt createdAt updatedAt")
        .lean();
    return chats;
}

export async function getChatMessages(userId, chatId) {
    const chat = await chatModel.findOne({ _id: chatId, userId });
    if (!chat) throw new ApiError(404, "Chat not found");

    const messages = await messageModel
        .find({ chatId })
        .sort({ createdAt: 1 })
        .select("role content toolName metadata createdAt")
        .lean();
    return messages;
}

export async function deleteChat(userId, chatId) {
    const chat = await chatModel.findOne({ _id: chatId, userId });
    if (!chat) throw new ApiError(404, "Chat not found");

    await messageModel.deleteMany({ chatId });
    await chatModel.findByIdAndDelete(chatId);
    return true;
}

export async function updateChatTitle(userId, chatId, title) {
    const chat = await chatModel.findOne({ _id: chatId, userId });
    if (!chat) throw new ApiError(404, "Chat not found");

    chat.title = title;
    await chat.save();
    return chat;
}