import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  _hasHydrated: boolean;
  
  // Actions
  login: (data: { user: User; role: Role; schoolId: string | null; accessToken: string }) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      schoolId: null,
      accessToken: null,
      _hasHydrated: false,

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
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      setAccessToken: (token: string) => set({ accessToken: token }),
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
)
