"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "herdshare_auth";
const AUTH_EVENT = "herdshare-auth-changed";

export type AuthState = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; fullName: string; role: string };
};

export function loadAuth(): AuthState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

function notifyAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function saveAuth(state: AuthState) {
  localStorage.setItem(KEY, JSON.stringify(state));
  notifyAuthChanged();
}

export function clearAuth() {
  localStorage.removeItem(KEY);
  notifyAuthChanged();
}

export function useAuth() {
  const [auth, setAuthState] = useState<AuthState | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setAuthState(loadAuth());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener(AUTH_EVENT, onChange);
    window.addEventListener("storage", onChange);
    window.addEventListener("focus", onChange);
    return () => {
      window.removeEventListener(AUTH_EVENT, onChange);
      window.removeEventListener("storage", onChange);
      window.removeEventListener("focus", onChange);
    };
  }, [refresh]);

  return {
    auth,
    ready,
    setAuth: (s: AuthState | null) => {
      if (s) saveAuth(s);
      else clearAuth();
      setAuthState(s);
    },
  };
}
