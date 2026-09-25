import { io, type Socket } from "socket.io-client";
import { API_URL } from "./config";

/** Events the `/app` namespace pushes to dashboards. They are triggers only; data is re-fetched. */
export const REALTIME_EVENTS = ["screen.presence", "screen.sync.ack", "screen.assignment.updated", "media.ready", "offer.published", "canvas.activate"] as const;
export type RealtimeEvent = (typeof REALTIME_EVENTS)[number];

let socket: Socket | null = null;

/**
 * Live updates are a convenience: every failure here is contained so the dashboard keeps working
 * on plain requests. A rejected token asks the caller to refresh it (the session change reconnects
 * with the new token); other failures fall back to long-polling and keep retrying with backoff.
 */
export function connectRealtime(token: string, onEvent: (event: RealtimeEvent, payload: unknown) => void, onAuthRejected?: () => void) {
  socket?.disconnect();
  socket = io(`${API_URL}/app`, { auth: { token }, transports: ["websocket", "polling"], reconnectionDelayMax: 30_000 });
  for (const ev of REALTIME_EVENTS) {
    socket.on(ev, (payload: unknown) => {
      try { onEvent(ev, payload); } catch (err) { console.warn(`[realtime] ${ev} handler failed`, err); }
    });
  }
  socket.on("connect_error", (err) => {
    if (/unauthor|expired|token/i.test(err.message)) { socket?.disconnect(); onAuthRejected?.(); }
  });
}

export function disconnectRealtime() {
  socket?.disconnect();
  socket = null;
}
