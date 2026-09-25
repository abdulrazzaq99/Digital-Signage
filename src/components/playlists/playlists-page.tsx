"use client";
import { useCompanyScope } from "@/components/admin/company-scope";
import { PlaylistsPage as CompanyPlaylists } from "@/components/portal/playlists-page";
import { Button } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { CompanyGate, CompanySelect } from "@/components/screens/query-guards";
import { PageHeader } from "@/components/ui/misc";
import { usePlaylists } from "@/lib/api/hooks/playlists";
import { Plus } from "lucide-react";

/** Super Admin playlists: the customer list scoped to one company, plus platform framing. */
export function PlaylistsPage() {
  const scope = useCompanyScope();
  const companyId = scope.companyId;
  const all = usePlaylists({ pageSize: 1 }, { companyId, enabled: !!companyId });
  const published = usePlaylists({ status: "PUBLISHED", pageSize: 1 }, { companyId, enabled: !!companyId });
  const drafts = usePlaylists({ status: "DRAFT", pageSize: 1 }, { companyId, enabled: !!companyId });
  const n = (q: typeof all) => q.data?.meta?.total ?? "—";

  return (
    <div className="space-y-5">
      <PageHeader title="Playlists" subtitle="Create, organize and publish content playlists to customer screens." action={<Button href={scope.withCompany("/playlists/new")} disabled={!companyId}><Plus className="h-4 w-4" /> Create Playlist</Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard value={n(all)} label="Total Playlists" sub={scope.companyName || "Select a company"} />
        <StatCard value={n(published)} label="Published" sub="Assigned to screens" tone="blue" />
        <StatCard value={n(drafts)} label="Drafts" sub="Not yet deployed" />
      </div>
      <Card className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span className="text-xs font-semibold text-slate-700">Playlist Context:</span>
        <div className="flex items-center gap-2 text-xs text-slate-500">Company: <CompanySelect className="w-44 [&_select]:h-8" aria-label="Company" value={companyId} onChange={scope.setCompanyId} /></div>
        <span className="ml-auto text-[11px] text-slate-400">Showing playlists for {scope.companyName || "…"}</span>
      </Card>
      <CompanyGate companyId={companyId} what="playlists"><CompanyPlaylists key={companyId} companyId={companyId} basePath="/playlists" query={`company=${companyId}`} /></CompanyGate>
    </div>
  );
}
