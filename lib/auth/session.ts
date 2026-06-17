"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "./store";
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

// Durasi sesi idle (harus sinkron dengan JWT_EXPIRES_IN di backend: 3 menit)
const SESSION_MS = 3 * 60 * 1000;
// Tampilkan warning 30 detik sebelum expired
const WARN_BEFORE_MS = 30 * 1000;
// Interval tick untuk countdown
const TICK_MS = 500;
// Throttle minimal antar token refresh (1 menit)
const REFRESH_THROTTLE_MS = 60 * 1000;

export type SessionStatus = {
  msLeft: number;
  showWarning: boolean;
};

export function useSessionTimer(): SessionStatus {
  const rememberMe = useAuthStore((s) => s.rememberMe);
  const lastActivity = useAuthStore((s) => s.lastActivity);
  const clear = useAuthStore((s) => s.clear);

  // now ticks setiap TICK_MS detik agar msLeft selalu fresh
  const [now, setNow] = useState(() => Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Kalau rememberMe, tidak perlu timer idle
    if (rememberMe) return;

    timerRef.current = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [rememberMe]);

  // Auto-logout saat sesi habis
  useEffect(() => {
    if (rememberMe) return;
    if (!lastActivity) return;
    const elapsed = now - lastActivity;
    if (elapsed >= SESSION_MS) {
      clear();
      if (typeof window !== "undefined") {
        window.location.replace("/login?expired=1");
      }
    }
  }, [now, lastActivity, rememberMe, clear]);

  if (rememberMe) {
    return { msLeft: Infinity, showWarning: false };
  }

  const msLeft = Math.max(0, SESSION_MS - (now - (lastActivity || now)));
  const showWarning = msLeft > 0 && msLeft <= WARN_BEFORE_MS;

  return { msLeft, showWarning };
}

export function useActivityTracker() {
  const touch = useAuthStore((s) => s.touch);
  const rememberMe = useAuthStore((s) => s.rememberMe);
  // Ref ke waktu terakhir refresh token, agar tidak terlalu sering
  const lastRefreshRef = useRef<number>(0);
  // Ref untuk throttle event handler
  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (rememberMe) return;

    const handleActivity = () => {
      // Throttle: hanya jalankan maksimal sekali per 5 detik
      if (throttleRef.current) return;
      throttleRef.current = setTimeout(() => {
        throttleRef.current = null;

        // Update lastActivity di store (reset countdown frontend)
        touch();

        // Refresh JWT di backend (throttle: max 1x per menit)
        const now = Date.now();
        if (now - lastRefreshRef.current >= REFRESH_THROTTLE_MS) {
          lastRefreshRef.current = now;
          const state = useAuthStore.getState();
          api
            .post<{ data: { token: string } }>(ENDPOINTS.auth.refresh, {
              rememberMe: state.rememberMe,
            })
            .then((res) => {
              const newToken = res.data?.data?.token;
              if (newToken) {
                // Update token di store tanpa mengubah user/rememberMe/lastActivity
                useAuthStore.setState({ token: newToken });
                // Sync cookie
                if (typeof document !== "undefined") {
                  document.cookie = `auth-token=${encodeURIComponent(newToken)}; path=/; SameSite=Lax`;
                }
              }
            })
            .catch(() => {
              // Refresh gagal (token sudah expired) → clear dan redirect
              useAuthStore.getState().clear();
              if (typeof window !== "undefined") {
                window.location.replace("/login?expired=1");
              }
            });
        }
      }, 5_000);
    };

    const events: (keyof DocumentEventMap)[] = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];
    events.forEach((e) => document.addEventListener(e, handleActivity, { passive: true }));

    return () => {
      events.forEach((e) => document.removeEventListener(e, handleActivity));
      if (throttleRef.current) clearTimeout(throttleRef.current);
    };
  }, [touch, rememberMe]);
}

/**
 * Panggil saat user klik "Perpanjang Sesi" di dialog.
 * Langsung refresh token dan reset lastActivity.
 */
export async function extendSession(): Promise<void> {
  const state = useAuthStore.getState();
  try {
    const res = await api.post<{ data: { token: string } }>(ENDPOINTS.auth.refresh, {
      rememberMe: state.rememberMe,
    });
    const newToken = res.data?.data?.token;
    if (newToken) {
      useAuthStore.setState({ token: newToken, lastActivity: Date.now() });
      if (typeof document !== "undefined") {
        document.cookie = `auth-token=${encodeURIComponent(newToken)}; path=/; SameSite=Lax`;
      }
    }
  } catch {
    state.clear();
    if (typeof window !== "undefined") {
      window.location.replace("/login?expired=1");
    }
  }
}
