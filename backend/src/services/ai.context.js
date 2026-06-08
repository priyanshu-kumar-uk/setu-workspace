import { SystemMessage, HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
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
function truncateHistory(history, maxTokens) {
    if (!history || history.length === 0) return [];
    const result = [];
    let usedTokens = 0;
    for (let i = history.length - 1; i >= 0; i--) {
        const msgTokens = estimateMessageTokens(history[i]);
        if (usedTokens + msgTokens > maxTokens) break;
        result.unshift(history[i]);
        usedTokens += msgTokens;
    }
    return result;
}
export function buildContext({ systemPrompt, history = [], ragContext = "", userMessage }) {
    const sysPrompt = systemPrompt || getSystemPrompt();
    const messages = [];
    let systemContent = sysPrompt;
    if (ragContext) {
        systemContent += `\n\nRelevant context from knowledge base:\n${ragContext}`;
    }
    messages.push(new SystemMessage(systemContent));
    const systemTokens = estimateTokens(systemContent);
    const userTokens = estimateTokens(userMessage);
    const remainingTokens = MAX_CONTEXT_TOKENS - systemTokens - userTokens - 50;
    const truncatedHistory = truncateHistory(history, remainingTokens);
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
    messages.push(new HumanMessage(userMessage));
    return messages;
}
export function summarizeConversation() {
    return null;
}
