import { ApiError } from "./api/client";
import type { AuthUser } from "./api/types";

/** "ONLINE" → "Online", "TEMPLATE_INSTANCE" → "Template Instance". */
export function label(value: string | null | undefined): string {
  if (!value) return "—";
  return value.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "Never";
  const s = Math.floor(Math.max(0, Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 45) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  return formatDate(iso);
}

export const formatDate = (iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  iso ? new Intl.DateTimeFormat("en-GB", opts).format(new Date(iso)) : "—";
export const formatDateTime = (iso: string | null | undefined) => formatDate(iso, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
/** ISO → value for `<input type="date">`. */
export const toDateInput = (iso: string | null | undefined) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");
/** `<input type="date">` value → ISO at local midnight, or null when blank. */
export const fromDateInput = (v: string) => (v ? new Date(`${v}T00:00:00`).toISOString() : null);

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB"];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(1)} ${units[i]}`;
}
export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m ? `${m}m ${s}s` : `${s}s`;
}
export function fmtClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const FRIENDLY: Record<string, string> = {
  INVALID_CREDENTIALS: "Incorrect email or password.",
  RATE_LIMITED: "Too many attempts. Please wait a minute and try again.",
  LICENSE_LIMIT_REACHED: "Your licence limit has been reached. Contact your administrator to add more screens.",
  LICENSE_INACTIVE: "Your licence is not active.",
  LICENSE_SUSPENDED: "Your licence is suspended.",
  PAIRING_CODE_INVALID: "That pairing code is not valid. Check the code on the screen and try again.",
  PAIRING_CODE_EXPIRED: "That pairing code has expired. Restart pairing on the screen to get a new code.",
  DEVICE_ALREADY_PAIRED: "This screen is already paired to another account.",
  MEDIA_IN_USE: "This file is used by a playlist. Remove it from the playlist first.",
  PLAYLIST_IN_USE: "This playlist is assigned to screens. Unassign it before deleting.",
  ATTEMPTS_EXHAUSTED: "You have used all your attempts for this campaign.",
  OFFERS_VISIT_REQUIRED: "Visit the Offers page before playing.",
  SCHEDULE_CONFLICT: "This schedule overlaps an existing one.",
  CANVAS_DEGRADED: "Not every screen in this canvas is online.",
  NETWORK: "Can't reach the API. Is the backend running?",
};

/** Friendly copy for a bare API code (e.g. an eligibility `reason`), falling back to a readable label. */
export const friendlyCode = (code: string | null | undefined) => (code ? FRIENDLY[code] ?? label(code) : "");

export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return FRIENDLY[e.code] ?? e.message;
  return e instanceof Error ? e.message : "Something went wrong.";
}

export const isSuperAdmin = (u: AuthUser | null | undefined) => u?.platformRole === "SUPER_ADMIN";
export const roleLabel = (u: AuthUser | null | undefined) => (!u ? "" : isSuperAdmin(u) ? "Super Admin" : label(u.companyRole));
