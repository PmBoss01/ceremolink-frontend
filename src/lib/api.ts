import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT access token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auto-refresh token on 401 and retry the original request
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh =
        typeof window !== 'undefined'
          ? localStorage.getItem('refresh_token')
          : null;
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
            refresh,
          });
          localStorage.setItem('access_token', data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
