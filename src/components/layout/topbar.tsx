"use client";
import { Menu, Search, Share2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/misc";
import { useAuth } from "@/components/auth/auth-provider";

import type { ShellConfig } from "./nav-config";

export function Topbar({ config, onToggle, collapsed }: { config: ShellConfig; onToggle: () => void; collapsed: boolean }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const t = config.titles.find((x) => x.match(pathname)) ?? config.titles[0];
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:gap-4 sm:px-5">
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
        {collapsed && <Avatar name={user?.name ?? ""} size="sm" className="hidden lg:flex" />}
      </div>
    </header>
  );
}
