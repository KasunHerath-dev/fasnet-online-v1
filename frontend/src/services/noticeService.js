import api from './api';

export const noticeService = {
    // Get notices with optional status filtering
    getAll: (params = {}) => api.get('/notices', { params }),

    // Admin Notice Management
    publish: (id) => api.patch(`/notices/${id}/publish`),
    unpublish: (id) => api.patch(`/notices/${id}/unpublish`),
    delete: (id) => api.delete(`/notices/${id}`),
    deleteAll: () => api.delete('/notices'),

    // Scraper Management
    getSettings: () => api.get('/notices/settings'),
    updateSettings: (data) => api.put('/notices/settings', data),
    triggerScrape: () => api.post('/notices/scrape'),
};
