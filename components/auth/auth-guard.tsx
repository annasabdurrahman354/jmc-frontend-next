"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth/store";
import { configureAuth, resetRedirectFlag } from "@/lib/api/client";
import { useSessionTimer, useActivityTracker, extendSession } from "@/lib/auth/session";
import { SessionWarningDialog } from "./session-warning-dialog";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const clear = useAuthStore((s) => s.clear);
  const rememberMe = useAuthStore((s) => s.rememberMe);
  const [hydrated, setHydrated] = useState(false);
  const { showWarning, msLeft } = useSessionTimer();
  useActivityTracker();

  // Konfigurasi axios auth interceptor
  useEffect(() => {
    configureAuth({
      getToken: () => useAuthStore.getState().token,
      onUnauthorized: () => {
        useAuthStore.getState().clear();
      },
    });
  }, []);

  // Hydration & reset flag
  useEffect(() => {
    setHydrated(true);
    resetRedirectFlag();

    // Reset lastActivity ke now saat mount supaya sesi tidak langsung expired
    // karena lastActivity yang tersimpan di localStorage mungkin stale.
    // Hanya lakukan ini jika token masih ada (pengguna masih login).
    if (!rememberMe && useAuthStore.getState().token) {
      useAuthStore.getState().touch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect ke login jika tidak ada token
  useEffect(() => {
    if (hydrated && !token) {
      const url = new URL(window.location.href);
      if (url.pathname !== "/login") {
        const loginUrl = new URL("/login", window.location.origin);
        loginUrl.searchParams.set("from", pathname);
        window.location.replace(loginUrl.toString());
      }
    }
  }, [hydrated, token, pathname, router]);

  if (!hydrated || !token) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-muted-foreground text-sm">Memuat...</div>
      </div>
    );
  }

  return (
    <>
      {children}
      <SessionWarningDialog
        open={showWarning}
        msLeft={msLeft}
        onExtend={extendSession}
        onLogout={clear}
      />
    </>
  );
}
