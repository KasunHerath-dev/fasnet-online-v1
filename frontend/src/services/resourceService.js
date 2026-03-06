import api from './api';

const resourceService = {
    // Upload a resource
    upload: (formData) => api.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Get resources by module
    getByModule: (moduleId) => api.get(`/resources/module/${moduleId}`),

    // Delete a resource
    delete: (id) => api.delete(`/resources/${id}`),

    // Get Auth URL
    getAuthUrl: () => api.get('/resources/auth/url'),

    // Download resource (Blob)
    download: (id) => api.get(`/resources/stream/${id}`, { responseType: 'blob' }),

    // Sync Cloudinary files
    syncCloudinary: () => api.post('/resources/sync-cloudinary'),

    // Mega Migration
    getPendingMega: () => api.get('/resources/mega-pending'),
    migrateSingleMega: (id) => api.post(`/resources/migrate-single/${id}`),

    // Cloudinary Sync & Init (Granular)
    getSyncPreview: () => api.get('/resources/sync-preview'),
    initFolders: () => api.post('/resources/init-folders'),
};

export default resourceService;

