import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./client";

let browserClient: QueryClient | undefined;

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Client errors (4xx) will not fix themselves; only retry transport and server failures.
        retry: (count, err) => !(err instanceof ApiError && err.status > 0 && err.status < 500) && count < 2,
      },
    },
  });
}

/** A fresh client per server render; one shared client for the lifetime of the browser tab. */
export function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  return (browserClient ??= makeQueryClient());
}

/** Root query keys, one per backend module. Mutations invalidate by root. */
export const keys = {
  auth: ["auth"],
  companies: ["companies"],
  licenses: ["licenses"],
  users: ["users"],
  screens: ["screens"],
  groups: ["groups"],
  media: ["media"],
  playlists: ["playlists"],
  schedules: ["schedules"],
  layouts: ["layouts"],
  templates: ["templates"],
  instances: ["template-instances"],
  offers: ["offers"],
  campaigns: ["campaigns"],
  winners: ["winners"],
  notifications: ["notifications"],
  activity: ["activity"],
  canvas: ["canvas"],
} as const;

/** Drops empty filter values so query keys and query strings stay stable. */
export const clean = <T extends object>(o: T): T => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== "" && v !== null)) as T;
