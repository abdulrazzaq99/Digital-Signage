"use client";
import { cn } from "@/lib/utils";
import { useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar collapsed={collapsed} />
      <div className={cn("flex min-h-screen flex-col transition-[padding] duration-200", collapsed ? "pl-16" : "pl-[232px]")}>
        <Topbar onToggle={() => setCollapsed((v) => !v)} collapsed={collapsed} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
