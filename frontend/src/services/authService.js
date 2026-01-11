import api from './api'

export const authService = {
  observers: [],

  subscribe: (func) => {
    authService.observers.push(func)
    return () => {
      authService.observers = authService.observers.filter((f) => f !== func)
    }
  },

  notify: (user) => {
    authService.observers.forEach((func) => func(user))
  },

  login: (username, password) =>
    api.post('/auth/login', { username, password }),

  register: (username, password, roles) =>
    api.post('/auth/register', { username, password, roles }),

  getCurrentUser: () =>
    api.get('/auth/me'),

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    authService.notify(null)
  },

  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),

  updatePreferences: (preferences) =>
    api.post('/auth/preferences', { preferences }),


  getAllUsers: () => api.get('/users'),

  getToken: () =>
    localStorage.getItem('token'),

  setToken: (token) =>
    localStorage.setItem('token', token),

  getUser: () =>
    JSON.parse(localStorage.getItem('user') || '{}'),

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    authService.notify(user)
  },

  // Admin User Management
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),

  getOnlineUsers: () => api.get('/users/online'),
  lockAllUsers: () => api.post('/users/lock-all'),
  unlockAllUsers: () => api.post('/users/unlock-all'),
}

export const studentService = {
  getAll: (params = {}) =>
    api.get('/students', { params }),

  getDemographics: (params = {}) =>
    api.get('/students/demographics', { params }), // params can contain batchYear

  getByRegNum: (registrationNumber) =>
    api.get(`/students/${registrationNumber}`),

  create: (studentData) =>
    api.post('/students', studentData),

  update: (registrationNumber, studentData) =>
    api.put(`/students/${registrationNumber}`, studentData),

  delete: (registrationNumber) =>
    api.delete(`/students/${registrationNumber}`),

  deleteAll: () =>
    api.delete('/students'),

  getUpcomingBirthdays: (days = 30) =>
    api.get('/students/birthdays/upcoming', { params: { days } }),

  createMissingUsers: () => api.post('/students/create-missing-users'),

  // Profile Requests
  createProfileRequest: (data) => api.post('/profile-requests', data),
  getProfileRequests: (params) => api.get('/profile-requests', { params }),
};

export const importService = {
  preview: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/import/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  importStudents: (file, updateIfExists = false, batchYear = '') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('updateIfExists', updateIfExists)
    if (batchYear) {
      formData.append('batchYear', batchYear)
    }
    return api.post('/import/students', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const missingStudentService = {
  getAll: (params = {}) =>
    api.get('/missing-students', { params }),

  delete: (id) =>
    api.delete(`/missing-students/${id}`),

  deleteAll: () =>
    api.delete('/missing-students'),

  moveToMain: (id) =>
    api.post(`/missing-students/${id}/move`),
}

export const batchYearService = {
  getAll: () =>
    api.get('/batch-years'),

  create: (data) =>
    api.post('/batch-years', data),

  update: (id, data) =>
    api.put(`/batch-years/${id}`, data),

  delete: (id) =>
    api.delete(`/batch-years/${id}`),
}

export const academicService = {
  getModules: () =>
    api.get('/academic/modules'),

  createModule: (data) =>
    api.post('/academic/modules', data),

  addResult: (data) =>
    api.post('/academic/results', data),

  updateResult: (id, data) =>
    api.put(`/academic/results/${id}`, data),

  getStudentProfile: (studentId) =>
    api.get(`/academic/student/${studentId}`),

  // Assessment System
  createAssessment: (data) =>
    api.post('/academic/assessments', data),

  addAssessmentResults: (data) =>
    api.post('/academic/assessments/results', data),

  calculateFinalGrade: (data) =>
    api.post('/academic/assessments/calculate-final', data),

  // Progression & Analytics
  promoteBatch: (data) => api.post('/academic/promote-batch', data),
  getRepeaters: (params) => api.get('/academic/repeaters', { params }),
  getModuleAnalytics: (params) => api.get('/academic/analytics/module', { params }),
  getBatchAnalytics: (params) => api.get('/academic/analytics/batch', { params }),

  // Combination Selection
  setCombination: (data) => api.post('/academic/set-combination', data),
  unlockCombination: (data) => api.post('/academic/unlock-combination', data),
  bulkUpdateCombination: (data) => api.post('/academic/bulk-combination', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Degree Selection
  getDegreeCandidates: (params) => api.get('/academic/degree-candidates', { params }),
  assignDegree: (data) => api.post('/academic/assign-degree', data),
}

export const systemService = {
  getStats: () => api.get('/system/stats'),
}

export const assessmentService = {
  uploadResults: (formData) => api.post('/assessments/upload-results', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

export const resourceService = {
  upload: (formData) => api.post('/resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getByModule: (moduleId) => api.get(`/resources/module/${moduleId}`),
  delete: (id) => api.delete(`/resources/${id}`),
  getAuthUrl: () => api.get('/resources/auth/url'),
}
