import { io, type Socket } from "socket.io-client";
import { API_URL } from "./config";

/** Events the `/app` namespace pushes to dashboards. They are triggers only; data is re-fetched. */
export const REALTIME_EVENTS = ["screen.presence", "screen.sync.ack", "screen.assignment.updated", "media.ready", "offer.published", "canvas.activate"] as const;
export type RealtimeEvent = (typeof REALTIME_EVENTS)[number];

let socket: Socket | null = null;

export function connectRealtime(token: string, onEvent: (event: RealtimeEvent, payload: unknown) => void) {
  socket?.disconnect();
  socket = io(`${API_URL}/app`, { auth: { token }, transports: ["websocket"] });
  for (const ev of REALTIME_EVENTS) socket.on(ev, (payload: unknown) => onEvent(ev, payload));
}

export function disconnectRealtime() {
  socket?.disconnect();
  socket = null;
}
