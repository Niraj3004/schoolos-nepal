import { create } from 'zustand'

export interface User {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

export type Role = 'SUPERADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | null;

interface AuthState {
  user: User | null;
  role: Role;
  schoolId: string | null;
  accessToken: string | null;
  
  // Actions
  login: (data: { user: User; role: Role; schoolId: string | null; accessToken: string }) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  schoolId: null,
  accessToken: null,

  login: (data) => set({
    user: data.user,
    role: data.role,
    schoolId: data.schoolId,
    accessToken: data.accessToken,
  }),

  logout: () => {
    set({
      user: null,
      role: null,
      schoolId: null,
      accessToken: null,
    });
    // The actual redirection will typically be handled in the component
    // or through a client-side router utility to avoid hard dependencies here.
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  setAccessToken: (token: string) => set({ accessToken: token }),
}))
