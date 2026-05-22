import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchChats, deleteChatApi, updateChatTitleApi } from "../services/ai.api.js";

export function useChatHistory() {
    return useQuery({
        queryKey: ["chats"],
        queryFn: async () => {
            const res = await fetchChats();
            return res.data; // ApiResponse.data contains the chats array
        },
        staleTime: 1000 * 60 * 2,
        refetchOnWindowFocus: false,
    });
}

export function useDeleteChat() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (chatId) => deleteChatApi(chatId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chats"] });
        },
    });
}

export function useRenameChat() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ chatId, title }) => updateChatTitleApi(chatId, title),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chats"] });
        },
    });
}
