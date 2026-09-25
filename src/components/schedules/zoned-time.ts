/**
 * Wall-clock time in a named time zone ↔ instants. A schedule for "09:00 Europe/London" must start
 * at 09:00 in London whatever zone the browser is in, so the instant sent to the API is computed in
 * the chosen zone (the API stores `startsAt` as an instant and `timezone` alongside it).
 */
import { z } from "zod";
import { dateInput, timezone } from "@/lib/validation/fields";

const pad = (n: number) => String(n).padStart(2, "0");

/** The browser's IANA zone, or UTC when the runtime can't tell. */
export const browserZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

/** Wall-clock parts of instant `t` in `tz`. */
function partsIn(t: number, tz: string) {
  const dtf = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const p = Object.fromEntries(dtf.formatToParts(new Date(t)).map((x) => [x.type, x.value]));
  return { y: Number(p.year), m: Number(p.month), d: Number(p.day), h: Number(p.hour) % 24, min: Number(p.minute), s: Number(p.second) };
}

/** How far `tz` is ahead of UTC at instant `t`, in ms. */
function offsetAt(t: number, tz: string) {
  const p = partsIn(t, tz);
  return Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - Math.floor(t / 1000) * 1000;
}

/**
 * `YYYY-MM-DD` + `HH:mm` read as wall-clock time in `tz` → the instant, or null when unparseable.
 * In a DST gap (a time that doesn't exist that day) it lands just after the jump.
 */
export function zonedToInstant(date: string, time: string, tz: string): Date | null {
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const tm = /^(\d{2}):(\d{2})$/.exec(time);
  if (!dm || !tm) return null;
  const wall = Date.UTC(Number(dm[1]), Number(dm[2]) - 1, Number(dm[3]), Number(tm[1]), Number(tm[2]));
  if (Number.isNaN(wall)) return null;
  try {
    // Two passes settle the offset across a DST change between the guess and the answer.
    let t = wall - offsetAt(wall, tz);
    const second = offsetAt(t, tz);
    if (wall - second !== t) t = wall - second;
    return new Date(t);
  } catch {
    return null;
  }
}

/** Now as `{ date, time }` wall-clock values in `tz`, for defaults and `min` hints. */
export function nowIn(tz: string, now = Date.now()) {
  try {
    const p = partsIn(now, tz);
    return { date: `${p.y}-${pad(p.m)}-${pad(p.d)}`, time: `${pad(p.h)}:${pad(p.min)}` };
  } catch {
    const d = new Date(now);
    return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
  }
}

/** An instant shown as wall-clock time in `tz`, e.g. "3 Oct 2026, 09:00". */
export function formatInZone(iso: string | null | undefined, tz: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
  } catch {
    return d.toISOString();
  }
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Schedule window: a start date and time (not in the past), an optional end (blank = open-ended;
 * an end date without a time ends at 23:59) after the start, all read in the chosen time zone.
 */
export const scheduleSchema = (now: () => number = Date.now) =>
  z
    .object({
      startDate: dateInput(),
      startTime: z.string().regex(TIME, "Enter a start time"),
      endDate: dateInput(false),
      endTime: z.string().refine((v) => !v || TIME.test(v), "Enter a valid time"),
      timezone: timezone(),
    })
    .superRefine((v, ctx) => {
      const start = zonedToInstant(v.startDate, v.startTime, v.timezone);
      if (!start) return void ctx.addIssue({ code: "custom", path: ["startDate"], message: "Enter a valid date" });
      if (start.getTime() < now() - 60_000) ctx.addIssue({ code: "custom", path: [v.startDate < nowIn(v.timezone, now()).date ? "startDate" : "startTime"], message: "The start can't be in the past" });
      if (v.endTime && !v.endDate) return void ctx.addIssue({ code: "custom", path: ["endDate"], message: "Add an end date, or clear the end time" });
      if (!v.endDate) return;
      const end = zonedToInstant(v.endDate, v.endTime || "23:59", v.timezone);
      if (!end) return void ctx.addIssue({ code: "custom", path: ["endDate"], message: "Enter a valid date" });
      if (end.getTime() <= start.getTime()) ctx.addIssue({ code: "custom", path: [v.endDate < v.startDate ? "endDate" : v.endTime ? "endTime" : "endDate"], message: "Must be after the start" });
    }, { when: (p) => p.issues.length === 0 });

export type ScheduleWindow = z.output<ReturnType<typeof scheduleSchema>>;

/** Parsed window → the API's instants (ISO, UTC) plus the zone they were chosen in. */
export function scheduleInstants(v: ScheduleWindow) {
  const startsAt = zonedToInstant(v.startDate, v.startTime, v.timezone)!.toISOString();
  const endsAt = v.endDate ? zonedToInstant(v.endDate, v.endTime || "23:59", v.timezone)!.toISOString() : null;
  return { startsAt, endsAt, timezone: v.timezone };
}
