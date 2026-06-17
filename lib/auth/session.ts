"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "./store";

const SESSION_MS = 3 * 60 * 1000;
const WARN_BEFORE_MS = 30 * 1000;
const TICK_MS = 1000;

export type SessionStatus = {
  msLeft: number;
  showWarning: boolean;
};

export function useSessionTimer(): SessionStatus {
  const rememberMe = useAuthStore((s) => s.rememberMe);
  const lastActivity = useAuthStore((s) => s.lastActivity);
  const [now, setNow] = useState(() => Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (rememberMe) return;
    timerRef.current = setInterval(() => {
      setNow(Date.now());
    }, TICK_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [rememberMe]);

  useEffect(() => {
    if (rememberMe) return;
    if (!lastActivity) return;
    const elapsed = now - lastActivity;
    if (elapsed >= SESSION_MS) {
      useAuthStore.getState().clear();
      if (typeof window !== "undefined") {
        window.location.replace("/login?expired=1");
      }
    }
  }, [now, lastActivity, rememberMe]);

  const msLeft = rememberMe
    ? Infinity
    : Math.max(0, SESSION_MS - (now - (lastActivity || now)));
  const showWarning = !rememberMe && msLeft > 0 && msLeft <= WARN_BEFORE_MS;

  return { msLeft, showWarning };
}

export function useActivityTracker() {
  const touch = useAuthStore((s) => s.touch);
  const rememberMe = useAuthStore((s) => s.rememberMe);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (rememberMe) return;
    let throttle: ReturnType<typeof setTimeout> | null = null;
    const handler = () => {
      if (throttle) return;
      throttle = setTimeout(() => {
        touch();
        throttle = null;
      }, 5000);
    };
    const events: (keyof DocumentEventMap)[] = ["mousemove", "keydown", "click"];
    events.forEach((e) => document.addEventListener(e, handler, { passive: true }));
    return () => {
      events.forEach((e) => document.removeEventListener(e, handler));
      if (throttle) clearTimeout(throttle);
    };
  }, [touch, rememberMe]);
}
