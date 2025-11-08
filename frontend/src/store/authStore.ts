import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await AsyncStorage.setItem('university', JSON.stringify(university));
    set({ user, token, university, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('university');
    set({ user: null, token: null, university: null, isAuthenticated: false });
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
        set({ user, token, university, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
      set({ isLoading: false });
    }
  },
}));