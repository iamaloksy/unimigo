import { create } from 'zustand';
import { AdminUser } from '@/types';

interface AuthState {
  admin: AdminUser | null;
  token: string | null;
  setAdmin: (admin: AdminUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Load from localStorage on init
  const storedAdmin = typeof window !== 'undefined' ? localStorage.getItem('admin') : null;
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  
  return {
    admin: storedAdmin ? JSON.parse(storedAdmin) : null,
    token: storedToken,
    setAdmin: (admin, token) => {
      localStorage.setItem('adminToken', token);
      localStorage.setItem('admin', JSON.stringify(admin));
      set({ admin, token });
    },
    logout: () => {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
      set({ admin: null, token: null });
    },
  };
});
