"use client";
import { Menu, Search, Share2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/misc";

const titles: { match: (p: string) => boolean; title: string; subtitle: string }[] = [
  { match: (p) => p === "/", title: "Overview", subtitle: "Monitor your platform and manage connected screens." },
  { match: (p) => p.startsWith("/companies"), title: "Companies", subtitle: "Manage customer companies, licenses, and screen capacity." },
  { match: (p) => p.startsWith("/licenses"), title: "License Management", subtitle: "Manage company screen limits and license status." },
  { match: (p) => p.startsWith("/screens/groups"), title: "Screen Group", subtitle: "Organize screens and publish content to groups." },
  { match: (p) => p.startsWith("/screens/canvas"), title: "Synchronized Canvas", subtitle: "Synchronize multiple screens into a single canvas display." },
  { match: (p) => p.startsWith("/screens"), title: "Screens", subtitle: "Monitor, manage and publish content to connected displays." },
  { match: (p) => p.startsWith("/media"), title: "Media", subtitle: "Upload and organize media assets." },
  { match: (p) => p.startsWith("/playlists"), title: "Playlists", subtitle: "Sequence content for your displays." },
  { match: (p) => p.startsWith("/layouts"), title: "Layouts / Templates", subtitle: "Design reusable screen layouts." },
  { match: (p) => p.startsWith("/offers"), title: "Offers / Marketplace", subtitle: "Manage promotional offers." },
  { match: (p) => p.startsWith("/scratch-win"), title: "Scratch & Win", subtitle: "Run interactive campaigns." },
  { match: (p) => p.startsWith("/notifications"), title: "Notifications", subtitle: "Platform alerts and messages." },
  { match: (p) => p.startsWith("/activity"), title: "Activity", subtitle: "Audit log of platform events." },
  { match: (p) => p.startsWith("/settings"), title: "Settings", subtitle: "Configure your platform." },
];

export function Topbar({ onToggle, collapsed }: { onToggle: () => void; collapsed: boolean }) {
  const pathname = usePathname();
  const t = titles.find((x) => x.match(pathname)) ?? titles[0];
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-5">
      <button onClick={onToggle} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="Toggle sidebar">
        <Menu className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-bold text-slate-900">{t.title}</h2>
        <p className="truncate text-[11px] text-slate-400">{t.subtitle}</p>
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search platform..." className="h-9 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-12 text-xs outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white" />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-slate-400">⌘K</kbd>
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="Share">
          <Share2 className="h-4 w-4" />
        </button>
        {collapsed && <Avatar name="Super Admin" size="sm" />}
      </div>
    </header>
  );
}
