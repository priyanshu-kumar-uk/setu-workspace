import { ChatMistralAI } from "@langchain/mistralai";
import { tool } from "@langchain/core/tools";
import { HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { tavily } from "@tavily/core";
import { z } from "zod";
import config from "../config/config.js";
const model = new ChatMistralAI({
    model: "mistral-large-latest",
    apiKey: config.MISTRAL_API_KEY,
    streaming: true,
});
const titleModel = new ChatMistralAI({
    model: "mistral-small-latest",
    apiKey: config.MISTRAL_API_KEY,
    maxTokens: 20,
});
async function withRateLimitRetry(fn, maxRetries = 3) {
    let delay = 2000; 
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            const status =
                err?.status ||
                err?.response?.status ||
                err?.raw_status_code ||
                (err?.message?.includes("429") ? 429 : null);
            const is429 =
                status === 429 ||
                err?.code === "3505" ||
                err?.message?.toLowerCase().includes("capacity exceeded") ||
                err?.message?.toLowerCase().includes("rate limit");
            if (is429 && attempt < maxRetries) {
                console.warn(`[AI] 429 rate limit hit. Retrying in ${delay / 1000}s... (attempt ${attempt}/${maxRetries})`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2; 
            } else if (is429) {
                const userErr = new Error(
                    "The AI service is currently busy. Please wait a moment and try again."
                );
                userErr.statusCode = 429;
                throw userErr;
            } else {
                throw err; 
            }
        }
    }
}
let tavilyClient = null;
function getTavilyClient() {
    if (!tavilyClient && config.TAVILY_API_KEY) {
        tavilyClient = tavily({ apiKey: config.TAVILY_API_KEY });
    }
    return tavilyClient;
}
const tavilySearchTool = tool(
    async ({ query }) => {
        const client = getTavilyClient();
        if (!client) return "Tavily search is not configured. Please set TAVILY_API_KEY.";
        const response = await client.search(query, { maxResults: 5 });
        const results = response.results.map(r => 
            `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`
        ).join("\n\n---\n\n");
        return results || "No results found.";
    },
    {
        name: "tavily_search",
        description: "Search the internet for real-time information. Use this when you need current data, news, facts, or anything that requires up-to-date web results.",
        schema: z.object({
            query: z.string().describe("The search query"),
        }),
    }
);
const tools = [tavilySearchTool];
const modelWithTools = model.bindTools(tools);
const toolMap = {};
for (const t of tools) {
    toolMap[t.name] = t;
}
function mergeToolCallChunks(accumulated) {
    const merged = [];
    for (const [, tc] of Object.entries(accumulated)) {
        if (!tc.name) continue;
        let args = {};
        try {
            args = typeof tc.args === "string" ? JSON.parse(tc.args) : (tc.args || {});
        } catch { args = {}; }
        merged.push({ name: tc.name, id: tc.id, args });
    }
    return merged;
}
export async function streamWithTools(messages, callbacks, abortSignal) {
    const { onToken, onToolStart, onToolEnd, onError } = callbacks;
    let fullResponse = "";
    let currentMessages = [...messages];
    let maxToolRounds = 5;
    for (let round = 0; round < maxToolRounds; round++) {
        if (abortSignal?.aborted) break;
        let roundMessage = null;
        let roundText = "";
        try {
            const stream = await withRateLimitRetry(() =>
                modelWithTools.stream(currentMessages, { signal: abortSignal })
            );
            for await (const chunk of stream) {
                if (abortSignal?.aborted) break;
                if (!roundMessage) {
                    roundMessage = chunk;
                } else {
                    roundMessage = roundMessage.concat(chunk);
                }
                let text = "";
                if (typeof chunk.content === "string") {
                    text = chunk.content;
                } else if (Array.isArray(chunk.content)) {
                    for (const part of chunk.content) {
                        if (typeof part === "string") text += part;
                        else if (part?.text) text += part.text;
                        else if (part?.type === "text" && part?.text) text += part.text;
                    }
                }
                if (text) {
                    roundText += text;
                    fullResponse += text;
                    onToken(text);
                }
            }
        } catch (err) {
            if (abortSignal?.aborted || err.name === "AbortError") break;
            console.error("Stream error:", err.message);
            throw err;
        }
        if (!roundMessage) break;
        currentMessages.push(roundMessage);
        const toolCalls = roundMessage.tool_calls || [];
        if (toolCalls.length === 0) break;
        for (const toolCall of toolCalls) {
            if (abortSignal?.aborted) break;
            const toolName = toolCall.name;
            const t = toolMap[toolName];
            if (!t) {
                currentMessages.push(new ToolMessage({
                    content: `Tool "${toolName}" not found.`,
                    tool_call_id: toolCall.id,
                }));
                continue;
            }
            try {
                onToolStart(toolName, toolCall.args);
                const result = await t.invoke(toolCall.args);
                const resultStr = typeof result === "string" ? result : JSON.stringify(result);
                currentMessages.push(new ToolMessage({
                    content: resultStr,
                    tool_call_id: toolCall.id,
                }));
                onToolEnd(toolName);
            } catch (toolErr) {
                onError?.(`Tool "${toolName}" failed: ${toolErr.message}`, true);
                currentMessages.push(new ToolMessage({
                    content: `Tool execution failed: ${toolErr.message}. Please answer from your existing knowledge.`,
                    tool_call_id: toolCall.id,
                }));
                onToolEnd(toolName);
            }
        }
    }
    return fullResponse;
}
export async function generateTitle(message) {
    const prompt = `Generate a 3 to 5 word title for a chat that starts with this message: "${message.slice(0, 200)}"
Rules:
- Return ONLY the title text
- No quotes, no period at the end
- Be concise and descriptive`;
    try {
        const response = await withRateLimitRetry(() => titleModel.invoke(prompt));
        return response.content.trim().replace(/^["']|["']$/g, "").replace(/\.$/, "");
    } catch (err) {
        console.warn("[AI] generateTitle failed, using fallback title:", err.message);
        return "New Chat";
    }
}
