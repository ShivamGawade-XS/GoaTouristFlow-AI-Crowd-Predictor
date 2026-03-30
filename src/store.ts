import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'goa-cds-auth' }
  )
);

interface UIState {
  activeBeachId: string | null;
  setActiveBeachId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeBeachId: null,
  setActiveBeachId: (id) => set({ activeBeachId: id }),
}));
