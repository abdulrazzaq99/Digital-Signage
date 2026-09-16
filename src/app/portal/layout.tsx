import { AppShell } from "@/components/layout/app-shell";
import type { ReactNode } from "react";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return <AppShell variant="portal">{children}</AppShell>;
}
