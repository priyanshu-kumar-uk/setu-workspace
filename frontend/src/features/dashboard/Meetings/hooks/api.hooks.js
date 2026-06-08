import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMeetingHistoryApi, scheduleMeetingApi, getUpcomingMeetingsApi, deleteMeetingHistoryApi } from '../services/meeting.api.js';
export function useMeetingHistory() {
    return useQuery({
        queryKey: ['meetingHistory'],
        queryFn: getMeetingHistoryApi,
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true
    });
}
export function useUpcomingMeetings() {
    return useQuery({
        queryKey: ['upcomingMeetings'],
        queryFn: getUpcomingMeetingsApi,
        staleTime: 1000 * 60 * 2, 
    });
}
export function useScheduleMeeting() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: scheduleMeetingApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['upcomingMeetings'] });
        }
    });
}
export function useDeleteMeetingHistory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteMeetingHistoryApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meetingHistory'] });
        }
    });
}
