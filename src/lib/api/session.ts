import { API_BASE } from "./config";

const KEY = "dsp.refresh";
let access: string | null = null;
let refreshing: Promise<boolean> | null = null;
const listeners = new Set<() => void>();
const expiredListeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

/** The access token lives in memory only; the rotating refresh token is the one thing persisted. */
export const session = {
  getAccess: () => access,
  getRefresh(): string | null {
    try { return localStorage.getItem(KEY); } catch { return null; }
  },
  setTokens(t: { accessToken: string; refreshToken: string }) {
    access = t.accessToken;
    try { localStorage.setItem(KEY, t.refreshToken); } catch { /* storage unavailable (private mode) */ }
    emit();
  },
  clear() {
    access = null;
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    emit();
  },
  /** Ends a session the API no longer accepts; the auth provider sends the user to /login. */
  expire() {
    session.clear();
    expiredListeners.forEach((fn) => fn());
  },
  onExpired(fn: () => void) { expiredListeners.add(fn); return () => { expiredListeners.delete(fn); }; },
  /** Single-flight: concurrent 401s share one refresh call. Resolves false (and clears) when the token is rejected. */
  refresh(): Promise<boolean> {
    if (refreshing) return refreshing;
    refreshing = (async () => {
      const refreshToken = session.getRefresh();
      if (!refreshToken) return false;
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken }) });
        // A rejected token (any 4xx but a rate limit) ends the session; a 5xx leaves it for the next try.
        if (res.status >= 400 && res.status < 500 && res.status !== 429) { session.expire(); return false; }
        if (!res.ok) return false;
        const { data } = (await res.json()) as { data: { accessToken: string; refreshToken: string } };
        session.setTokens(data);
        return true;
      } catch {
        return false;
      } finally {
        refreshing = null;
      }
    })();
    return refreshing;
  },
  onChange(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
};
