// services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.41.252.254:8000'; // Replace with your IP

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    } catch (error) {
      console.log('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user_id']);
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  get: (endpoint) => api.get(endpoint),
  post: (endpoint, data) => api.post(endpoint, data),
  put: (endpoint, data) => api.put(endpoint, data),
  delete: (endpoint) => api.delete(endpoint),
  login: (credentials) => api.post('/login/', credentials),
  register: (userData) => api.post('/signup/', userData),
};

export default api;
