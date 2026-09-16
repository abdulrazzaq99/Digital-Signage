"use client";
import { useCompanyScope } from "@/components/admin/company-scope";
import { FullPageSpinner } from "@/components/auth/require-session";
import { PortalUseLayout } from "@/components/portal/use-layout";
import { Alert } from "@/components/ui/misc";

/** Super Admin builds a multi-zone layout on a company's behalf; the flow is the customer one, scoped by `?company=`. */
export function UseLayout({ id }: { id: string }) {
  const scope = useCompanyScope();
  if (scope.isPending) return <FullPageSpinner />;
  if (!scope.companyId) return <Alert tone="amber">Create a company before building layouts.</Alert>;
  return (
    <div className="space-y-3">
      <Alert tone="blue">Building this layout for <span className="font-semibold">{scope.companyName}</span>. Content choices come from that company&apos;s library.</Alert>
      <PortalUseLayout key={scope.companyId} id={id} companyId={scope.companyId} basePath="/layouts?tab=zones" />
    </div>
  );
}
