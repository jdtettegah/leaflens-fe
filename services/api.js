import axios from 'axios';
import { Platform } from 'react-native';

const getBaseURL = () => {
  if (__DEV__) {
    return 'https://c404798ead30.ngrok-free.app'; // ngrok forwarding url 
  }
  return 'https://your-production-api.com'; // production url 
};

const BASE_URL = getBaseURL();

// Debug logging
console.log('=== API SERVICE DEBUG ===');
console.log('Platform:', Platform.OS);
console.log('Development mode:', __DEV__);
console.log('Base URL:', BASE_URL);
console.log('========================');

// Create axios instance with debugging
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 Making API request:');
    console.log('- Method:', config.method?.toUpperCase());
    console.log('- URL:', config.url);
    console.log('- Full URL:', `${config.baseURL}${config.url}`);
    console.log('- Data:', config.data);
    console.log('- Headers:', config.headers);
    return config;
  },
  (error) => {
    console.log('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API response received:');
    console.log('- Status:', response.status);
    console.log('- Data:', response.data);
    return response;
  },
  (error) => {
    console.log('❌ API response error:');
    if (error.response) {
      console.log('- Status:', error.response.status);
      console.log('- Data:', error.response.data);
    } else if (error.request) {
      console.log('- No response received');
      console.log('- Request:', error.request);
    } else {
      console.log('- Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  register: (data) => apiClient.post('/signup/', data),
  login: (data) => apiClient.post('/login/', data),
};