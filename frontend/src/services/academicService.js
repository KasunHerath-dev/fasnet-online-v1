import api from './api';

export const academicService = {
    // Get all modules
    getModules: async () => {
        const response = await api.get('/academic/modules');
        return response.data;
    },

    // Get current user's enrolled modules
    getMyEnrollments: async () => {
        const response = await api.get('/academic/my-enrollments');
        return response.data;
    },

    // Get student academic profile
    getStudentProfile: async (studentId) => {
        const response = await api.get(`/academic/student/${studentId}`);
        return response.data;
    },

    // Create a new module (Admin)
    createModule: async (data) => {
        const response = await api.post('/academic/modules', data);
        return response.data;
    }
};
