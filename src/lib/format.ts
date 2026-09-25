import { ApiError } from "./api/client";
import type { AuthUser } from "./api/types";

/** "ONLINE" → "Online", "TEMPLATE_INSTANCE" → "Template Instance". */
export function label(value: string | null | undefined): string {
  if (!value) return "—";
  return value.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "Never";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const s = Math.floor(Math.max(0, Date.now() - t) / 1000);
  if (s < 45) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  return formatDate(iso);
}

/** Formats an ISO date; missing or unparseable values render "—" instead of throwing during render. */
export const formatDate = (iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : new Intl.DateTimeFormat("en-GB", opts).format(d);
};
export const formatDateTime = (iso: string | null | undefined) => formatDate(iso, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const pad = (n: number) => String(n).padStart(2, "0");
const localDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/**
 * ISO → value for `<input type="date">`, in the browser's local calendar. (Taking the UTC date put
 * edit forms a day early for anyone east of UTC, because `fromDateInput` saves local midnight.)
 */
export const toDateInput = (iso: string | null | undefined) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? localDate(d) : "";
};
/** ISO → value for `<input type="datetime-local">` (local time, minutes). */
export const toDateTimeInput = (iso: string | null | undefined) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? `${localDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}` : "";
};
/** `<input type="datetime-local">` value → ISO, or null when blank. */
export const fromDateTimeInput = (v: string) => (v ? new Date(v).toISOString() : null);
/** Today in the browser's calendar, for `min` on date inputs. */
export const todayInput = () => localDate(new Date());
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
  NETWORK: "Can't reach the server. Check your connection and try again.",
  TIMEOUT: "The server took too long to respond. Please try again.",
  BAD_RESPONSE: "The server sent an unexpected response. Please try again.",
  SERVER_ERROR: "The server hit a problem. Please try again in a moment.",
  INTERNAL_ERROR: "Something went wrong on our side. Please try again in a moment.",
  PAYLOAD_TOO_LARGE: "That file or request is too large.",
  MALFORMED_JSON: "The request could not be read. Please reload the page and try again.",
  VALUE_TOO_LONG: "One of the values is too long.",
  WRITE_CONFLICT: "Someone else changed this at the same time. Please try again.",
  FOREIGN_KEY: "Something this refers to no longer exists. Reload and try again.",
  DUPLICATE: "That name is already in use. Choose a different one.",
  COMPANY_READ_ONLY: "This account is read-only right now. Contact your administrator to make changes.",
  UPLOAD_SIZE_MISMATCH: "The upload didn't complete. Please upload the file again.",
  IN_USE: "This is still in use. Remove it from where it's used first.",
  CAMPAIGN_ACTIVE: "This campaign is live. Deactivate it before changing it.",
  COMPANY_HAS_SCREENS: "Unpair this company's screens before deleting it.",
  SELF_CHANGE: "You can't change your own role or deactivate yourself.",
  PLAYLIST_EMPTY: "Add at least one item to this playlist first.",
  IDEMPOTENCY_IN_PROGRESS: "That's already being saved. Please wait a moment.",
  FORBIDDEN: "You don't have permission to do that.",
  NOT_FOUND: "This item no longer exists. It may have been deleted.",
};

/** Friendly copy for a bare API code (e.g. an eligibility `reason`), falling back to a readable label. */
export const friendlyCode = (code: string | null | undefined) => (code ? FRIENDLY[code] ?? label(code) : "");

export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.code === "RATE_LIMITED") {
      const wait = (e.details as { retryAfterSec?: number } | undefined)?.retryAfterSec;
      return wait ? `Too many attempts. Please wait ${wait < 60 ? `${wait} seconds` : `${Math.ceil(wait / 60)} minutes`} and try again.` : FRIENDLY.RATE_LIMITED!;
    }
    if (e.code === "VALIDATION_ERROR" && Array.isArray(e.details) && e.details.length) {
      const first = e.details[0] as { path?: string; message?: string };
      const field = first.path?.split(".").pop();
      return field && first.message ? `${label(field)}: ${first.message}` : e.message;
    }
    return FRIENDLY[e.code] ?? e.message;
  }
  return e instanceof Error && e.message ? e.message : "Something went wrong.";
}

export const isSuperAdmin = (u: AuthUser | null | undefined) => u?.platformRole === "SUPER_ADMIN";
export const roleLabel = (u: AuthUser | null | undefined) => (!u ? "" : isSuperAdmin(u) ? "Super Admin" : label(u.companyRole));
