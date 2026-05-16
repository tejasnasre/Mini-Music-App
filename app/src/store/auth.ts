import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mmkvStorage } from "@/lib/storage";

interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  /** Returns true on success, false on wrong credentials */
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userEmail: null,

      login: (email, password) => {
        const validEmail = process.env.EXPO_PUBLIC_TEST_EMAIL ?? "";
        const validPassword = process.env.EXPO_PUBLIC_TEST_PASSWORD ?? "";

        if (
          email.trim().toLowerCase() === validEmail.toLowerCase() &&
          password === validPassword
        ) {
          set({ isAuthenticated: true, userEmail: email.trim().toLowerCase() });
          return true;
        }
        return false;
      },

      logout: () => set({ isAuthenticated: false, userEmail: null }),
    }),
    {
      name: "auth-storage",
      // MMKV is synchronous → state is hydrated before the first render
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
