import { SystemMessage, HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";

// ─── System Prompt ────────────────────────────────────────
const getSystemPrompt = () => {
    const currentDate = new Date().toLocaleDateString("en-US", { 
        weekday: "long", year: "numeric", month: "long", day: "numeric" 
    });
    
    return `You are Setu AI, a highly capable and professional assistant. You are helpful, precise, and articulate.

Current Date: ${currentDate}

Your capabilities:
- Answer questions accurately and thoroughly
- Search the internet for real-time information when needed. You MUST use the tavily_search tool for any questions about recent events, current news, real-time data, or anything that happened after your training cutoff.
- Write and explain code in any programming language
- Analyze data and provide insights
- Help with writing, editing, and creative tasks

Guidelines:
- Be concise but thorough
- Use markdown formatting for clarity (headings, lists, code blocks, tables)
- When you search the internet, synthesize the results naturally — do not just list raw data
- If you're unsure about something, say so honestly
- For code, always specify the language in code blocks
- Be conversational and helpful`;
};

const MAX_CONTEXT_TOKENS = 28000;  
const CHARS_PER_TOKEN = 4;

function estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / CHARS_PER_TOKEN);
}

function estimateMessageTokens(msg) {
    return estimateTokens(msg.content || "") + 10;
}

// ─── Token-Aware History Truncation ───────────────────────
/**
 * Includes as many previous messages as fit safely within
 * the model context window. Most recent messages are prioritized.
 * 
 * Future: Replace with conversation summarization for extremely long chats.
 */
function truncateHistory(history, maxTokens) {
    if (!history || history.length === 0) return [];

    const result = [];
    let usedTokens = 0;

    // Walk backward — most recent messages first
    for (let i = history.length - 1; i >= 0; i--) {
        const msgTokens = estimateMessageTokens(history[i]);
        if (usedTokens + msgTokens > maxTokens) break;
        result.unshift(history[i]);
        usedTokens += msgTokens;
    }

    return result;
}

// ─── Context Builder ──────────────────────────────────────
/**
 * Builds a LangChain-compatible message array from conversation data.
 * Core architecture layer that combines all context sources.
 *
 * @param {Object} params
 * @param {string} params.systemPrompt - override default system prompt
 * @param {Array}  params.history - array of { role, content, toolName, toolCallId }
 * @param {string} params.ragContext - future RAG injection (empty for now)
 * @param {string} params.userMessage - latest user input
 * @returns {Array} LangChain message array
 */
export function buildContext({ systemPrompt, history = [], ragContext = "", userMessage }) {
    const sysPrompt = systemPrompt || getSystemPrompt();
    const messages = [];

    // System prompt
    let systemContent = sysPrompt;

    // Future RAG context injection point
    if (ragContext) {
        systemContent += `\n\nRelevant context from knowledge base:\n${ragContext}`;
    }

    messages.push(new SystemMessage(systemContent));

    // Estimate remaining token budget
    const systemTokens = estimateTokens(systemContent);
    const userTokens = estimateTokens(userMessage);
    const remainingTokens = MAX_CONTEXT_TOKENS - systemTokens - userTokens - 50;

    // Token-aware history truncation
    const truncatedHistory = truncateHistory(history, remainingTokens);

    // Convert history to LangChain messages
    for (const msg of truncatedHistory) {
        switch (msg.role) {
            case "user":
                messages.push(new HumanMessage(msg.content || ""));
                break;
            case "assistant":
                messages.push(new AIMessage(msg.content || ""));
                break;
            case "system":
                messages.push(new SystemMessage(msg.content || ""));
                break;
            case "tool":
                messages.push(new ToolMessage({
                    content: msg.content || "",
                    tool_call_id: msg.toolCallId || "unknown",
                }));
                break;
            default:
                messages.push(new HumanMessage(msg.content || ""));
        }
    }

    // Latest user message
    messages.push(new HumanMessage(userMessage));

    return messages;
}

// ─── Future: Conversation Summarization Placeholder ───────
/**
 * When a conversation exceeds a certain length, this function
 * would summarize older messages to preserve context while
 * staying within token limits.
 * 
 * Not implemented yet — placeholder for future upgrade.
 */
export function summarizeConversation(/* messages, model */) {
    // TODO: Implement when needed
    // 1. Take oldest N messages
    // 2. Send to LLM with "summarize this conversation" prompt
    // 3. Replace those messages with a single SystemMessage summary
    return null;
}
