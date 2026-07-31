import { create } from 'zustand';
import { User } from 'firebase/auth';

export type UserRole = 'volunteer' | 'ngo' | 'admin' | null;

interface AuthState {
  user: User | null;
  role: UserRole;
  loading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: UserRole) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  loading: true,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setLoading: (loading) => set({ loading }),
  clearAuth: () => set({ user: null, role: null, loading: false }),
}));
