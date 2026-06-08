import { useQuery } from "@tanstack/react-query";
import { fetchChatMessages } from "../services/ai.api.js";
export function useChatMessages(chatId) {
    return useQuery({
        queryKey: ["chat-messages", chatId],
        queryFn: async () => {
            const res = await fetchChatMessages(chatId);
            return res.data; 
        },
        enabled: !!chatId,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
}
