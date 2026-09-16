"use client";
import { cn } from "@/lib/utils";
import { useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);
  const toggle = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) setMobileOpen((v) => !v);
    else setCollapsed((v) => !v);
  };
  return (
    <div className="min-h-screen bg-slate-50">
      {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />}
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={cn("flex min-h-screen flex-col transition-[padding] duration-200", collapsed ? "lg:pl-16" : "lg:pl-[232px]")}>
        <Topbar onToggle={toggle} collapsed={collapsed} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
