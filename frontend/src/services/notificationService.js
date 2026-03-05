import api from './api';

export const notificationService = {
    // Get all notifications for the logged-in user
    getAll: () => api.get('/notifications'),

    // Mark a single notification as read
    markRead: (id) => api.patch(`/notifications/${id}/read`),

    // Mark all notifications as read
    markAllRead: () => api.patch('/notifications/mark-all-read'),

    // Delete a notification
    delete: (id) => api.delete(`/notifications/${id}`),
};
