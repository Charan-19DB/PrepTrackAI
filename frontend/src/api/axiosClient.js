import axios from 'axios';

const isDev = import.meta.env.DEV;
const defaultBaseUrl = isDev 
  ? '/api' 
  : 'https://preptrack-backend-tlvg.onrender.com/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token to outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('preptrack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle token expiration
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    // If not already on login or register, can clear token
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      // Optional: don't force logout immediately on silent background checks
    }
  }
  return Promise.reject(error);
});

export default api;
