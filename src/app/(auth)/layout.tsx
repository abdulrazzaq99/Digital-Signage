import { AuthFooter, BrandPanel } from "@/components/layout/brand-panel";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <BrandPanel />
      <div className="flex flex-1 flex-col px-6 py-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
        <AuthFooter />
      </div>
    </div>
  );
}
