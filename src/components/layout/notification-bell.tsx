"use client";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Floating, useDismiss } from "@/components/ui/floating";
import { useInbox } from "@/lib/api/hooks/notifications";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

/** When this browser last opened the list, so only newer notifications count as unread. Storage may be unavailable. */
function readSeen(key: string): number {
  try { return Number(localStorage.getItem(key)) || 0; } catch { return 0; }
}
function writeSeen(key: string, at: number) {
  try { localStorage.setItem(key, String(at)); } catch { /* unread count resets on reload */ }
}

/** The company user's notifications from the Super Admin and from upload reviews, with an unread count. */
export function NotificationBell() {
  const { user } = useAuth();
  const inbox = useInbox({ enabled: !!user });
  const [open, setOpen] = useState(false);
  const key = `inbox-seen:${user?.id ?? ""}`;
  // Saved per user; the list loads after sign-in, so reading storage while rendering is safe.
  const [saved, setSaved] = useState<{ key: string; at: number } | null>(null);
  const seen = saved?.key === key ? saved.at : readSeen(key);
  // What counted as seen when the list was opened, so new items keep their dot while it is open.
  const [seenAtOpen, setSeenAtOpen] = useState(0);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useDismiss(open, () => setOpen(false), [button, panel]);

  const items = inbox.data?.data ?? [];
  const unread = items.filter((n) => Date.parse(n.sentAt) > seen).length;

  const toggle = () => {
    if (!open && items.length) {
      const latest = Math.max(seen, ...items.map((n) => Date.parse(n.sentAt)));
      setSeenAtOpen(seen);
      setSaved({ key, at: latest });
      writeSeen(key, latest);
    }
    setOpen(!open);
  };

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        className={cn("relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 sm:h-9 sm:w-9", open && "bg-slate-50")}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">{unread > 9 ? "9+" : unread}</span>}
      </button>
      <Floating anchor={button} open={open} panelRef={panel} placement="bottom-end" role="dialog" aria-label="Notifications" className="w-80 max-w-[calc(100vw-32px)] rounded-xl border border-slate-200 bg-white shadow-lg animate-pop-in">
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">Notifications</div>
        {inbox.isError ? (
          <div className="px-4 py-6 text-center text-xs text-slate-500">Couldn&apos;t load notifications. <button type="button" className="font-medium text-blue-600 hover:underline" onClick={() => inbox.refetch()}>Try again</button></div>
        ) : inbox.isPending ? (
          <div className="px-4 py-6 text-center text-xs text-slate-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-slate-400">No notifications yet.</div>
        ) : (
          <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
            {items.map((n) => {
              const isNew = Date.parse(n.sentAt) > seenAtOpen;
              // Only portal pages open from here; other links are meant for the mobile app.
              const href = n.deepLink?.startsWith("/portal") ? n.deepLink : null;
              const content = (
                <>
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", isNew ? "bg-blue-600" : "bg-transparent")} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-900">{n.title}</div>
                    <p className="mt-0.5 whitespace-pre-line break-words text-xs text-slate-600">{n.body}</p>
                    <div className="mt-1 text-[10px] text-slate-400">{timeAgo(n.sentAt)}</div>
                  </div>
                </>
              );
              return (
                <li key={n.id}>
                  {href ? <Link href={href} onClick={() => setOpen(false)} className="flex gap-3 px-4 py-3 hover:bg-slate-50">{content}</Link> : <div className="flex gap-3 px-4 py-3">{content}</div>}
                </li>
              );
            })}
          </ul>
        )}
      </Floating>
    </>
  );
}
