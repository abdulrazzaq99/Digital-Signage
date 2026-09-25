"use client";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, requestData } from "@/lib/api/client";
import { keys } from "@/lib/api/query";
import { connectRealtime, disconnectRealtime, type RealtimeEvent } from "@/lib/api/realtime";
import { session } from "@/lib/api/session";
import type { AuthUser } from "@/lib/api/types";

type Status = "loading" | "anonymous" | "authenticated";

export interface AuthContextValue {
  status: Status;
  user: AuthUser | null;
  /** The customer's own company; null for the Super Admin, who targets companies per call. */
  companyId: string | null;
  login(email: string, password: string): Promise<AuthUser>;
  logout(): Promise<void>;
  refreshUser(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Which cached data a real-time event makes stale. */
const INVALIDATE: Record<RealtimeEvent, (readonly string[])[]> = {
  "screen.presence": [keys.screens, keys.groups, keys.canvas],
  "screen.sync.ack": [keys.screens, keys.canvas],
  "screen.assignment.updated": [keys.screens, keys.groups, keys.playlists],
  "media.ready": [keys.media, keys.playlists],
  "offer.published": [keys.offers],
  "canvas.activate": [keys.canvas, keys.screens],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  const loadUser = useCallback(async () => {
    const me = await requestData(() => api.GET("/auth/me"));
    setUser(me);
    setStatus("authenticated");
    return me;
  }, []);

  // Restore the session from the refresh token on first load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!session.getRefresh()) { setStatus("anonymous"); return; }
      const ok = await session.refresh();
      if (cancelled) return;
      if (!ok) { setStatus("anonymous"); return; }
      try { await loadUser(); } catch { session.clear(); setStatus("anonymous"); }
    })();
    return () => { cancelled = true; };
  }, [loadUser]);

  // The API rejected the session (refresh token revoked, user deactivated): drop cached data; the
  // route guard then sends the user to /login with a `next` back to where they were.
  useEffect(() => session.onExpired(() => {
    disconnectRealtime();
    qc.clear();
    setUser(null);
    setStatus("anonymous");
  }), [qc]);

  // Real-time: connected while authenticated, reconnected whenever the access token rotates.
  useEffect(() => {
    if (status !== "authenticated") { disconnectRealtime(); return; }
    const connect = () => {
      const token = session.getAccess();
      if (token) connectRealtime(token, (event) => { for (const k of INVALIDATE[event] ?? []) qc.invalidateQueries({ queryKey: k }); }, () => void session.refresh());
    };
    connect();
    const off = session.onChange(() => { if (session.getAccess()) connect(); else disconnectRealtime(); });
    return () => { off(); disconnectRealtime(); };
  }, [status, qc]);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await requestData(() => api.POST("/auth/login", { body: { email, password } }));
    session.setTokens(tokens);
    setUser(tokens.user);
    setStatus("authenticated");
    return tokens.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = session.getRefresh();
    if (refreshToken) await api.POST("/auth/logout", { body: { refreshToken } }).catch(() => undefined);
    session.clear();
    qc.clear();
    setUser(null);
    setStatus("anonymous");
  }, [qc]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, companyId: user?.companyId ?? null, login, logout, refreshUser: async () => { await loadUser(); } }),
    [status, user, login, logout, loadUser],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
