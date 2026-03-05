import api from './api';

export const otpService = {
    requestOTP: async (registrationNumber) => {
        return api.post('/auth/request-otp', { registrationNumber });
    },

    verifyOTP: async (registrationNumber, otp) => {
        return api.post('/auth/verify-otp', { registrationNumber, otp });
    },

    setupPassword: async (registrationNumber, otp, newPassword) => {
        return api.post('/auth/setup-password', { registrationNumber, otp, newPassword });
    }
};
