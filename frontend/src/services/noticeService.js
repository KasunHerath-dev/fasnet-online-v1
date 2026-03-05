import api from './api';

export const noticeService = {
    // Get all active notices
    getAll: () => api.get('/notices'),
};
