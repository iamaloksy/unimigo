import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_URL = Platform.OS === 'web' ? 'http://localhost:8001' : 'http://192.168.217.1:8001';

interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

const api = {
  get: async (url: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const fullUrl = `${API_URL}/api${url}`;
      console.log('GET Request:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('API Error:', error);
        if (error.logout) {
          await AsyncStorage.clear();
          window.location.href = '/';
        }
        throw { response: { data: error, status: response.status } };
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      return { data };
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  },

  post: async (url: string, data?: any) => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/api${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw { response: { data: error, status: response.status } };
    }
    
    return { data: await response.json() };
  },

  put: async (url: string, data?: any) => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/api${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw { response: { data: error, status: response.status } };
    }
    
    return { data: await response.json() };
  },

  delete: async (url: string) => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/api${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw { response: { data: error, status: response.status } };
    }
    
    return { data: await response.json() };
  },
};

export default api;
