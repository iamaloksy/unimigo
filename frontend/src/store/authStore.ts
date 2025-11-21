import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Platform } from 'react-native';

interface User {
  id: string;
  name: string;
  email: string;
  universityId: string;
  trustScore: number;
  verifiedBadge: boolean;
  profileImage?: string;
  department?: string;
  year?: number;
}

interface University {
  id: string;
  name: string;
  theme: {
    primaryColor: string;
    accentColor: string;
  };
}

interface AuthState {
  user: User | null;
  university: University | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User, token: string, university: University) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  university: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: async (user, token, university) => {
    if (token) await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    if (university) await AsyncStorage.setItem('university', JSON.stringify(university));
    
    set({
      user,
      token,
      university,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log('Logout started, token exists:', !!token);

      // Get the correct API URL based on platform
      const API_URL = Platform.OS === 'web' ? 'http://localhost:8001' : 'http://192.168.217.1:8001';

      // Call backend logout API to invalidate token
      if (token) {
        try {
          const response = await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          console.log('Logout API response:', response.status);
        } catch (apiError) {
          console.log('Backend logout error (non-blocking):', apiError);
        }
      }

      // Clear all stored data
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('university');
      console.log('Cleared AsyncStorage');

      // Reset zustand state
      set({
        user: null,
        token: null,
        university: null,
        isAuthenticated: false,
        isLoading: false,
      });
      console.log('State reset complete');

      // Reset navigation stack
      setTimeout(() => {
        router.replace('/auth/login');
      }, 100);
      
    } catch (error) {
      console.error('Logout Error:', error);
      throw error;
    }
  },

  updateUser: (updatedUser) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedUser } : null,
    }));
  },

  loadFromStorage: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userJson = await AsyncStorage.getItem('user');
      const universityJson = await AsyncStorage.getItem('university');

      if (token && userJson && universityJson) {
        const user = JSON.parse(userJson);
        const university = JSON.parse(universityJson);

        set({
          user,
          token,
          university,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
      set({ isLoading: false });
    }
  },
}));
