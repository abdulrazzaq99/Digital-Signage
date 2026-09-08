"use client";
import { cn } from "@/lib/utils";
import {
  Activity, Bell, Building2, ChevronDown, FileBadge, Image as ImageIcon, LayoutDashboard, LayoutTemplate, ListVideo, Monitor, Settings, Tag, Ticket,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Avatar } from "@/components/ui/misc";

interface NavItem { label: string; href: string; icon: ReactNode; children?: { label: string; href: string }[] }

const nav: NavItem[] = [
  { label: "Overview", href: "/", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Companies", href: "/companies", icon: <Building2 className="h-4 w-4" /> },
  { label: "Licenses", href: "/licenses", icon: <FileBadge className="h-4 w-4" /> },
  { label: "Screens", href: "/screens", icon: <Monitor className="h-4 w-4" />, children: [
    { label: "All Screens", href: "/screens" },
    { label: "Screen Groups", href: "/screens/groups" },
    { label: "Synchronized Canvas", href: "/screens/canvas" },
  ] },
  { label: "Media", href: "/media", icon: <ImageIcon className="h-4 w-4" /> },
  { label: "Playlists", href: "/playlists", icon: <ListVideo className="h-4 w-4" /> },
  { label: "Layouts / Templates", href: "/layouts", icon: <LayoutTemplate className="h-4 w-4" /> },
  { label: "Offers / Marketplace", href: "/offers", icon: <Tag className="h-4 w-4" /> },
  { label: "Scratch & Win", href: "/scratch-win", icon: <Ticket className="h-4 w-4" /> },
  { label: "Notifications", href: "/notifications", icon: <Bell className="h-4 w-4" /> },
  { label: "Activity", href: "/activity", icon: <Activity className="h-4 w-4" /> },
  { label: "Settings", href: "/settings", icon: <Settings className="h-4 w-4" /> },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const [openScreens, setOpenScreens] = useState(pathname.startsWith("/screens"));
  const screensOpen = openScreens || pathname.startsWith("/screens");

  return (
    <aside className={cn("fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-[width] duration-200", collapsed ? "w-16" : "w-[232px]")}>
      <div className={cn("flex h-16 items-center gap-2.5 border-b border-slate-100", collapsed ? "justify-center px-0" : "px-5")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
          <LayoutDashboard className="h-4 w-4" />
        </div>
        {!collapsed && <span className="text-sm font-bold text-slate-900">DSP Admin</span>}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-0.5">
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            const hasChildren = !!item.children;
            const expanded = hasChildren && screensOpen && !collapsed;
            return (
              <li key={item.href}>
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex flex-1 items-center gap-2.5 rounded-lg text-[13px] font-medium transition-colors",
                      collapsed ? "h-9 justify-center" : "h-9 px-3",
                      active ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    )}
                    onClick={() => hasChildren && setOpenScreens(true)}
                  >
                    <span className={cn(active ? "text-white" : "text-slate-400")}>{item.icon}</span>
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!collapsed && hasChildren && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenScreens((v) => !v); }}
                        className={cn("rounded p-0.5", active ? "text-white/80" : "text-slate-400")}
                        aria-label="Toggle"
                      >
                        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
                      </button>
                    )}
                  </Link>
                </div>
                {expanded && (
                  <ul className="mt-1 space-y-0.5 pl-4">
                    {item.children!.map((c) => {
                      const sub = c.href === "/screens" ? pathname === "/screens" || (pathname.startsWith("/screens/") && !pathname.startsWith("/screens/groups") && !pathname.startsWith("/screens/canvas")) : isActive(pathname, c.href);
                      return (
                        <li key={c.href}>
                          <Link href={c.href} className={cn("flex h-8 items-center gap-2.5 rounded-lg px-3 text-xs font-medium transition-colors", sub ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800")}>
                            <span className={cn("h-1 w-1 rounded-full", sub ? "bg-blue-600" : "bg-slate-300")} />
                            {c.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={cn("flex items-center gap-2.5 border-t border-slate-100 py-3", collapsed ? "justify-center" : "px-4")}>
        <Avatar name="Alex Rivera" src="https://picsum.photos/seed/alexr/80/80" size={collapsed ? "sm" : "md"} />
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold text-slate-900">Alex Rivera</div>
            <div className="truncate text-[10px] text-blue-600">Super Admin</div>
          </div>
        )}
      </div>
    </aside>
  );
}
