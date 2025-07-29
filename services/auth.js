// services/auth.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api';

export const authService = {
  login: async (username, password) => {
    try {
      const response = await apiService.login({ username, password });
      const { token, user_id, email } = response.data;
      
      // Store token and user info
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user_id', user_id.toString());
      await AsyncStorage.setItem('user_email', email);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user_id', 'user_email']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  getToken: async () => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return !!token;
    } catch (error) {
      return false;
    }
  },
};