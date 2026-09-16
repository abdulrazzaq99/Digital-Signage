"use client";
import { cn } from "@/lib/utils";
import { ChevronDown, LayoutDashboard, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/ui/misc";

import type { ShellConfig } from "./nav-config";

function isActive(pathname: string, href: string, basePath: string) {
  if (href === basePath) return pathname === basePath;
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar({ config, collapsed, mobileOpen, onClose }: { config: ShellConfig; collapsed: boolean; mobileOpen?: boolean; onClose?: () => void }) {
  const isCollapsed = collapsed;
  const pathname = usePathname();
  const parentWithChildren = config.nav.find((n) => n.children)?.href;
  const [openScreens, setOpenScreens] = useState(!!parentWithChildren && pathname.startsWith(parentWithChildren));
  const screensOpen = openScreens || (!!parentWithChildren && pathname.startsWith(parentWithChildren));

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-[width,transform] duration-200",
      "w-[232px] lg:translate-x-0",
      mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
      isCollapsed ? "lg:w-16" : "lg:w-[232px]",
    )}>
      <div className={cn("flex h-16 items-center gap-2.5 border-b border-slate-100 px-5", collapsed && "lg:justify-center lg:px-0")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
          <LayoutDashboard className="h-4 w-4" />
        </div>
        <span className={cn("min-w-0", collapsed && "lg:hidden")}><span className="block truncate text-sm font-bold text-slate-900">{config.brand.name}</span>{config.brand.subtitle && <span className="block text-[10px] leading-3 text-slate-400">{config.brand.subtitle}</span>}</span>
        {onClose && <button onClick={onClose} className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 lg:hidden" aria-label="Close menu"><X className="h-4 w-4" /></button>}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-0.5">
          {config.nav.map((item) => {
            const active = isActive(pathname, item.href, config.basePath);
            const hasChildren = !!item.children;
            const expanded = hasChildren && screensOpen;
            return (
              <li key={item.href}>
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex h-9 flex-1 items-center gap-2.5 rounded-lg px-3 text-[13px] font-medium transition-colors",
                      collapsed && "lg:justify-center lg:px-0",
                      active ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    )}
                    onClick={() => { if (hasChildren) setOpenScreens(true); else onClose?.(); }}
                  >
                    <span className={cn(active ? "text-white" : "text-slate-400")}>{item.icon}</span>
                    <span className={cn("flex-1 truncate", collapsed && "lg:hidden")}>{item.label}</span>
                    {hasChildren && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenScreens((v) => !v); }}
                        className={cn("rounded p-0.5", active ? "text-white/80" : "text-slate-400", collapsed && "lg:hidden")}
                        aria-label="Toggle"
                      >
                        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
                      </button>
                    )}
                  </Link>
                </div>
                {expanded && (
                  <ul className={cn("mt-1 space-y-0.5 pl-4", collapsed && "lg:hidden")}>
                    {item.children!.map((c) => {
                      const siblings = item.children!.filter((x) => x.href !== c.href).map((x) => x.href);
                      const sub = c.href === item.href ? isActive(pathname, c.href, config.basePath) && !siblings.some((h) => pathname.startsWith(h)) : isActive(pathname, c.href, config.basePath);
                      return (
                        <li key={c.href}>
                          <Link href={c.href} onClick={() => onClose?.()} className={cn("flex h-8 items-center gap-2.5 rounded-lg px-3 text-xs font-medium transition-colors", sub ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800")}>
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

      <div className={cn("flex items-center gap-2.5 border-t border-slate-100 px-4 py-3", collapsed && "lg:justify-center lg:px-0")}>
        <Avatar name={config.user.name} src={`https://picsum.photos/seed/${config.user.avatarSeed}/80/80`} size="md" />
        {(
          <div className={cn("min-w-0", collapsed && "lg:hidden")}>
            <div className="truncate text-xs font-semibold text-slate-900">{config.user.name}</div>
            <div className="truncate text-[10px] text-blue-600">{config.user.role}</div>
          </div>
        )}
      </div>
    </aside>
  );
}
