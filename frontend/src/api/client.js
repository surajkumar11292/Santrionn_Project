import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request Interceptor: Attach JWT Token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract standard envelope and handle session expiration
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorData = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: error.message || 'Network communication failure'
    };
    return Promise.reject(errorData);
  }
);

export const api = {
  // Authentication
  auth: {
    login: (email, password) => apiClient.post('/api/auth/login', { email, password }),
    refreshToken: (refreshToken) => apiClient.post('/api/auth/refresh', { refreshToken })
  },

  // Disasters
  disasters: {
    list: (params = {}) => apiClient.get('/disasters', { params }),
    getById: (id) => apiClient.get(`/disasters/${id}`),
    create: (data) => apiClient.post('/disasters', data),
    update: (id, data) => apiClient.patch(`/disasters/${id}`, data),
    delete: (id) => apiClient.delete(`/disasters/${id}`)
  },

  // Resources (PostGIS Proximity Search)
  resources: {
    getNearby: (disasterId, params = {}) =>
      apiClient.get(`/disasters/${disasterId}/resources`, { params }),
    create: (disasterId, data) =>
      apiClient.post(`/disasters/${disasterId}/resources`, data)
  },

  // Community Reports (Redis Cache-Aside)
  reports: {
    getByDisaster: (disasterId) => apiClient.get(`/disasters/${disasterId}/reports`),
    syncExternal: (disasterId) => apiClient.post(`/disasters/${disasterId}/sync-reports`)
  },

  // Asynchronous Background Jobs
  jobs: {
    getStatus: (jobId) => apiClient.get(`/jobs/${jobId}`)
  },

  // Official Emergency Bulletins & Advisories
  updates: {
    getByDisaster: (disasterId) => apiClient.get(`/disasters/${disasterId}/updates`),
    create: (disasterId, data) => apiClient.post(`/disasters/${disasterId}/updates`, data)
  },

  // Health Check
  health: () => apiClient.get('/health')
};

export default apiClient;
