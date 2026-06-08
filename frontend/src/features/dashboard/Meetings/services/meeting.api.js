import api from '../../../axiosInstance';
export const getMeetingHistoryApi = async () => {
    const response = await api.get('/meetings/history');
    return response.data;
};
export const scheduleMeetingApi = async (payload) => {
    const response = await api.post('/meetings/schedule', payload);
    return response.data;
};
export const getUpcomingMeetingsApi = async () => {
    const response = await api.get('/meetings/schedule/upcoming');
    return response.data;
};
export const deleteMeetingHistoryApi = async (id) => {
    const response = await api.delete(`/meetings/history/${id}`);
    return response.data;
};
