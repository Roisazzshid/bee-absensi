"use client";

import { apiFetch, ApiError } from "@/lib/api";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const TOKEN_KEY = "bee_absensi_token";
const USER_KEY = "bee_absensi_user";

export type AuthUser = {
  id: number;
  email: string;
  role: string;
  profile?: { full_name?: string; nip?: string; department?: string; position?: string; avatar_url?: string | null } | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  status: "loading" | "authenticated" | "unauthenticated";
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  request: <T>(path: string, options?: RequestInit) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
    setStatus("unauthenticated");
  }, []);

  const loadUser = useCallback(async (savedToken: string) => {
    const response = await apiFetch<AuthUser>("/user", {}, savedToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data));
    setUser(response.data);
    setToken(savedToken);
    setStatus("authenticated");
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    void (async () => {
      if (!savedToken) {
        await Promise.resolve();
        setStatus("unauthenticated");
        return;
      }
      try {
        setToken(savedToken);
        await loadUser(savedToken);
      } catch {
        clearSession();
      }
    })();
  }, [clearSession, loadUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await apiFetch<{ token: string; user: AuthUser }>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(TOKEN_KEY, response.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    setUser(response.data.user);
    setToken(response.data.token);
    setStatus("authenticated");
    try {
      await loadUser(response.data.token);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) clearSession();
      throw error;
    }
  }, [clearSession, loadUser]);

  const signOut = useCallback(async () => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    try {
      if (savedToken) await apiFetch<null>("/logout", { method: "POST" }, savedToken);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const request = useCallback(async <T,>(path: string, options: RequestInit = {}) => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) {
      clearSession();
      throw new ApiError("Sesi Anda telah berakhir. Silakan masuk kembali.", 401);
    }
    try {
      return (await apiFetch<T>(path, options, savedToken)).data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) clearSession();
      throw error;
    }
  }, [clearSession]);

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const value = useMemo(
    () => ({ user, token, status, isAdmin, signIn, signOut, request }),
    [isAdmin, request, signIn, signOut, status, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth harus digunakan di dalam AuthProvider.");
  return context;
}
