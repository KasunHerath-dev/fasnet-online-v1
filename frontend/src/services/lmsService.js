// src/services/lmsService.js
import api from './api';

const lmsService = {
  // Save LMS credentials (encrypted on backend)
  saveCredentials: (lmsUsername, lmsPassword) =>
    api.post('/lms/credentials', { lmsUsername, lmsPassword, consent: true }),

  // Remove stored credentials + wipe assignments
  removeCredentials: () => api.delete('/lms/credentials'),

  // Trigger a manual sync
  triggerSync: () => api.post('/lms/sync/trigger'),

  // Get all saved assignments/deadlines
  getAssignments: () => api.get('/lms/assignments'),

  // Toggle an assignment as completed
  toggleComplete: (id) => api.patch(`/lms/assignments/${id}/complete`),
};

export default lmsService;
