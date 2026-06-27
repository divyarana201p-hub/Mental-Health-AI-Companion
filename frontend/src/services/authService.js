import axios from 'axios';
import * as securityService from './securityService';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for CSRF protection
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = securityService.getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await securityService.refreshToken();
        if (newToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        securityService.clearStorage();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  const response = await api.post('/users/login', { email, password });
  return response.data;
};

export const signup = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const logout = async () => {
  try {
    await api.post('/users/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const sendChatMessage = async (message) => {
  const response = await api.post('/chat/send', { message });
  return response.data;
};

export const getChatHistory = async () => {
  const response = await api.get('/chat/history');
  return response.data;
};

export const submitAssessment = async (responses) => {
  const response = await api.post('/assessment/submit', { responses });
  return response.data;
};

export const getAssessmentHistory = async () => {
  const response = await api.get('/assessment/history');
  return response.data;
};

export default api;
