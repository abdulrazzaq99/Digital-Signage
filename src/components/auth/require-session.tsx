"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { isSuperAdmin } from "@/lib/format";
import { useAuth } from "./auth-provider";

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" aria-label="Loading" />
    </div>
  );
}

/** Gates a dashboard: anonymous users go to login, signed-in users go to the dashboard for their role. */
export function RequireSession({ area, children }: { area: "admin" | "portal"; children: ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const home = isSuperAdmin(user) ? "/" : "/portal";
  const wrongArea = status === "authenticated" && (area === "admin") !== isSuperAdmin(user);

  useEffect(() => {
    if (status === "anonymous") router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (wrongArea) router.replace(home);
  }, [status, wrongArea, home, pathname, router]);

  if (status !== "authenticated" || wrongArea) return <FullPageSpinner />;
  return <>{children}</>;
}
