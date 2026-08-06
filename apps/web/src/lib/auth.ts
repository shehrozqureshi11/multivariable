"use client";

import { useEffect, useState } from "react";

const KEY = "herdshare_auth";

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

export function saveAuth(state: AuthState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuth(loadAuth());
    setReady(true);
  }, []);

  return {
    auth,
    ready,
    setAuth: (s: AuthState | null) => {
      if (s) saveAuth(s);
      else clearAuth();
      setAuth(s);
    },
  };
}
