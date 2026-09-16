"use client";
import { cn } from "@/lib/utils";
import { useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { adminShell, portalShell } from "./nav-config";
import { RequireSession } from "@/components/auth/require-session";

export function AppShell({ variant, children }: { variant: "admin" | "portal"; children: ReactNode }) {
  const config = variant === "portal" ? portalShell : adminShell;
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
    <RequireSession area={variant}>
    <div className="min-h-screen bg-slate-50">
      {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />}
      <Sidebar config={config} collapsed={collapsed} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={cn("flex min-h-screen flex-col transition-[padding] duration-200", collapsed ? "lg:pl-16" : "lg:pl-[232px]")}>
        <Topbar config={config} onToggle={toggle} collapsed={collapsed} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
    </RequireSession>
  );
}
