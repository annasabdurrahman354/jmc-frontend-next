import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Permission } from "@/lib/api/types";

export type SessionUser = {
  id: number;
  nama: string;
  username: string;
  role: { id: number; namaRole: string };
};

type AuthState = {
  token: string | null;
  user: SessionUser | null;
  permissions: Permission[];
  rememberMe: boolean;
  lastActivity: number;
  setSession: (data: { token: string; user: SessionUser }, rememberMe: boolean) => void;
  setPermissions: (perms: Permission[]) => void;
  touch: () => void;
  clear: () => void;
};

const COOKIE_NAME = "auth-token";

function setCookie(value: string | null) {
  if (typeof document === "undefined") return;
  if (value === null) {
    document.cookie = `${COOKIE_NAME}=; Max-Age=0; path=/`;
  } else {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      permissions: [],
      rememberMe: false,
      lastActivity: Date.now(),
      setSession: ({ token, user }, rememberMe) => {
        setCookie(token);
        set({ token, user, rememberMe, lastActivity: Date.now() });
      },
      setPermissions: (permissions) => set({ permissions }),
      touch: () => set({ lastActivity: Date.now() }),
      clear: () => {
        setCookie(null);
        set({
          token: null,
          user: null,
          permissions: [],
          rememberMe: false,
          lastActivity: 0,
        });
      },
    }),
    {
      name: "jmc-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        token: s.token,
        user: s.user,
        permissions: s.permissions,
        rememberMe: s.rememberMe,
        lastActivity: s.lastActivity,
      }),
    },
  ),
);
