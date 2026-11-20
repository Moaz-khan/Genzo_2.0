import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (data: { fullName: string; email: string; password: string; phone?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  restoreSession: () => Promise<void>;
  updateUser: (data: Partial<AuthUser>) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.login({ email, password });
          if (res.success && res.data) {
            const user: AuthUser = {
              id: res.data.user.id,
              fullName: res.data.user.fullName || res.data.user.full_name,
              email: res.data.user.email,
              phone: res.data.user.phone,
              role: res.data.user.role,
            };
            const token = res.data.token;
            localStorage.setItem('genzo_auth_token', token);
            set({ user, token, isLoading: false });
            return { success: true };
          }
          set({ isLoading: false });
          return { success: false, message: res.message || 'Invalid credentials' };
        } catch {
          set({ isLoading: false });
          return { success: false, message: 'Connection error. Is the server running?' };
        }
      },

      signup: async (data) => {
        set({ isLoading: true });
        try {
          const res = await api.signup(data);
          if (res.success && res.data) {
            const user: AuthUser = {
              id: res.data.user.id,
              fullName: res.data.user.fullName || res.data.user.full_name,
              email: res.data.user.email,
              phone: res.data.user.phone,
              role: res.data.user.role,
            };
            const token = res.data.token;
            localStorage.setItem('genzo_auth_token', token);
            set({ user, token, isLoading: false });
            return { success: true };
          }
          set({ isLoading: false });
          return { success: false, message: res.message || 'Could not create account' };
        } catch {
          set({ isLoading: false });
          return { success: false, message: 'Connection error. Is the server running?' };
        }
      },

      logout: () => {
        localStorage.removeItem('genzo_auth_token');
        set({ user: null, token: null });
      },

      restoreSession: async () => {
        const token = localStorage.getItem('genzo_auth_token');
        if (!token || get().user) return;
        try {
          const res = await api.getMe();
          if (res.success && res.data) {
            const user: AuthUser = {
              id: res.data.id,
              fullName: res.data.fullName || res.data.full_name,
              email: res.data.email,
              phone: res.data.phone,
              role: res.data.role,
            };
            set({ user, token });
          } else {
            localStorage.removeItem('genzo_auth_token');
            set({ user: null, token: null });
          }
        } catch {
          // Server not reachable — keep token for retry on next load
        }
      },

      updateUser: (data) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...data } });
      },
    }),
    {
      name: 'genzo-auth',
      // Only persist user & token — not loading state
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
