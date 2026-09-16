"use client";
import { CompanyFilter } from "@/components/admin/company-scope";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FilterSelect, PillTabs, SearchInput } from "@/components/ui/input";
import { Alert, Avatar, Drawer, DropdownMenu, Pagination } from "@/components/ui/misc";
import { EmptyState, QueryState } from "@/components/ui/query-state";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { CAMPAIGN_STATUSES, campaignTone, useActivateCampaign, useCampaigns, useDeactivateCampaign, useRedeemWinner, useWinners } from "@/lib/api/hooks/campaigns";
import type { Campaign, Winner } from "@/lib/api/types";
import { formatDate, formatDateTime, label } from "@/lib/format";
import { Check, Eye, Lock, Pencil, Power, Star, Ticket, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ScratchShell, prizeTone } from "./scratch-shell";

export function WinnerDrawer({ winner, onClose }: { winner: Winner | null; onClose: () => void }) {
  const toast = useToast();
  const redeem = useRedeemWinner();
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState<Winner | null>(null);
  const w = done?.id === winner?.id ? done : winner;
  const close = () => { onClose(); setConfirming(false); setDone(null); };
  const go = () => w && redeem.mutate(w.id, { onSuccess: (r) => { setDone(r); setConfirming(false); toast.success("Prize redeemed", `${r.prize.name} for ${r.user.name}`); }, onError: (e) => toast.error(e) });
  return (
    <Drawer open={!!winner} onClose={close}>
      {w && (
        <>
          <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4"><div><div className="text-sm font-semibold text-slate-900">Winner Detail</div><div className="text-[11px] text-slate-400">Prize redemption management</div></div><button onClick={close} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-400" aria-label="Close"><X className="h-3.5 w-3.5" /></button></div>
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3"><Avatar name={w.user.name} size="lg" className="bg-blue-600" /><div><div className="text-sm font-semibold text-slate-900">{w.user.name}</div><div className="text-[11px] text-slate-400">{w.user.email}</div><div className="text-[11px] text-slate-400">{w.company?.name ?? "—"}</div></div></div>
            <dl className="divide-y divide-slate-100 text-xs">{([["Campaign", w.campaign.title], ["Prize Won", <span key="p" className="text-blue-600">{w.prize.name}{w.prize.value ? ` · ${w.prize.value}` : ""}</span>], ["Won At", formatDateTime(w.wonAt)], ["Company", w.company?.name ?? "—"], ["Redemption", <Badge key="r" tone={w.redemption === "REDEEMED" ? "green" : "amber"} dot>{label(w.redemption)}</Badge>], ...(w.redeemedAt ? [["Redeemed At", formatDateTime(w.redeemedAt)]] : [])] as [string, React.ReactNode][]).map(([k, v]) => <div key={k} className="flex items-center justify-between py-2.5"><dt className="text-slate-400">{k}</dt><dd className="font-semibold text-slate-800">{v}</dd></div>)}</dl>
            {done?.id === w.id ? (
              <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 animate-fade-in"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-white"><Check className="h-3.5 w-3.5" /></span><div><div className="text-xs font-semibold text-green-800">Prize Redeemed</div><div className="text-[11px] text-green-700">Recorded on the server; it cannot be redeemed twice.</div></div></div>
            ) : w.redemption === "REDEEMED" ? (
              <Button variant="secondary" className="w-full" disabled><Check className="h-3.5 w-3.5" /> Already Redeemed</Button>
            ) : confirming ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 animate-fade-in">
                <div className="text-sm font-semibold text-amber-800">Confirm Redemption</div>
                <p className="mt-1 text-[11px] leading-4 text-amber-700">Mark <span className="font-semibold">{w.prize.name}</span> as redeemed for <span className="font-semibold">{w.user.name}</span>? This is permanent.</p>
                <div className="mt-3 grid grid-cols-2 gap-2"><Button variant="secondary" size="sm" onClick={() => setConfirming(false)}>Cancel</Button><Button variant="success" size="sm" onClick={go} disabled={redeem.isPending}>{redeem.isPending ? "Saving…" : "Confirm Redemption"}</Button></div>
              </div>
            ) : (
              <>
                <Alert tone="blue" icon={<Lock className="h-3.5 w-3.5 shrink-0" />}>Redemption is recorded server-side. Marking as redeemed is permanent and idempotent.</Alert>
                <Button className="w-full" onClick={() => setConfirming(true)}><Check className="h-3.5 w-3.5" /> Mark as Redeemed</Button>
              </>
            )}
          </div>
        </>
      )}
    </Drawer>
  );
}

export function CampaignsPage({ tab }: { tab: "campaigns" | "winners" }) {
  const toast = useToast();
  const [status, setStatus] = useState<"All" | Campaign["status"]>("All");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [wf, setWf] = useState({ campaignId: "", companyId: "", redemption: "", search: "", page: 1 });
  const campaigns = useCampaigns({ status: status === "All" ? undefined : status, search: q || undefined, page }, { enabled: tab === "campaigns" });
  const allCampaigns = useCampaigns({ pageSize: 100 }, { enabled: tab === "winners" });
  const winners = useWinners({ campaignId: wf.campaignId || undefined, companyId: wf.companyId || undefined, redemption: (wf.redemption || undefined) as "PENDING" | "REDEEMED" | undefined, search: wf.search || undefined, page: wf.page }, { enabled: tab === "winners" });
  const activate = useActivateCampaign();
  const deactivate = useDeactivateCampaign();
  const toggle = (c: Campaign) => (c.status === "ACTIVE" ? deactivate : activate).mutate(c.id, { onSuccess: (r) => toast.success(r.status === "ACTIVE" ? "Campaign activated" : "Campaign deactivated", r.title), onError: (e) => toast.error(e) });

  if (tab === "winners") {
    return (
      <ScratchShell tab="winners">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput placeholder="Search winners..." className="w-56" value={wf.search} onChange={(e) => setWf({ ...wf, search: e.target.value, page: 1 })} />
            <FilterSelect label="All Campaigns" options={(allCampaigns.data?.data ?? []).map((c) => ({ value: c.id, label: c.title }))} value={wf.campaignId} onChange={(v) => setWf({ ...wf, campaignId: v, page: 1 })} />
            <CompanyFilter value={wf.companyId} onChange={(v) => setWf({ ...wf, companyId: v, page: 1 })} />
            <FilterSelect label="All Statuses" options={[{ value: "PENDING", label: "Pending" }, { value: "REDEEMED", label: "Redeemed" }]} value={wf.redemption} onChange={(v) => setWf({ ...wf, redemption: v, page: 1 })} />
          </div>
          <span className="text-xs text-slate-400">{winners.data?.meta?.total ?? 0} winners</span>
        </div>
        <QueryState query={winners} empty={<EmptyState icon={<Star className="h-5 w-5" />} title="No winners yet" body="Winners appear here as customers play active campaigns." />}>
          {({ data, meta }) => (
            <>
              <Card>
                <Table>
                  <THead><tr><TH>User</TH><TH>Company</TH><TH>Campaign</TH><TH>Prize</TH><TH>Won At</TH><TH>Redemption</TH></tr></THead>
                  <tbody>{data.map((w) => <TR key={w.id} className="cursor-pointer" onClick={() => setWinner(w)}><TD><div className="flex items-center gap-3"><Avatar name={w.user.name} size="sm" className="bg-blue-600" /><div><div className="text-sm font-semibold text-slate-900">{w.user.name}</div><div className="text-[11px] text-slate-400">{w.user.email}</div></div></div></TD><TD className="text-xs font-medium text-slate-800">{w.company?.name ?? "—"}</TD><TD className="text-xs">{w.campaign.title}</TD><TD><Badge tone={prizeTone(w.prize.name)}>{w.prize.name}</Badge></TD><TD className="text-xs text-slate-500 whitespace-nowrap">{formatDateTime(w.wonAt)}</TD><TD><Badge tone={w.redemption === "REDEEMED" ? "green" : "amber"} dot>{label(w.redemption)}</Badge></TD></TR>)}</tbody>
                </Table>
              </Card>
              {meta && meta.totalPages > 1 && <Pagination page={meta.page} pages={meta.totalPages} onChange={(p) => setWf({ ...wf, page: p })} summary={`${meta.total} winners`} />}
            </>
          )}
        </QueryState>
        <WinnerDrawer winner={winner} onClose={() => setWinner(null)} />
      </ScratchShell>
    );
  }

  return (
    <ScratchShell tab="campaigns">
      <div className="flex flex-wrap items-center gap-3"><SearchInput placeholder="Search campaigns..." className="w-64" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /><PillTabs options={[{ value: "All" as const, label: "All" }, ...CAMPAIGN_STATUSES.map((s) => ({ value: s, label: label(s) }))]} value={status} onChange={(v) => { setStatus(v); setPage(1); }} /></div>
      <QueryState query={campaigns} empty={<EmptyState icon={<Ticket className="h-5 w-5" />} title={q || status !== "All" ? "No campaigns match" : "No campaigns yet"} body="Create a campaign with prizes and activate it for customers." action={<Button href="/scratch-win/new">Create Campaign</Button>} />}>
        {({ data, meta }) => (
          <>
            <Card>
              <Table>
                <THead><tr><TH>Campaign</TH><TH>Status</TH><TH>Start Date</TH><TH>End Date</TH><TH className="text-right">Attempts</TH><TH className="text-right">Winners</TH><TH className="text-right">Actions</TH></tr></THead>
                <tbody>{data.map((c) => <TR key={c.id}><TD><Link href={`/scratch-win/${c.id}`} className="flex items-center gap-3"><span className="flex h-8 w-12 items-center justify-center overflow-hidden rounded bg-indigo-900 text-indigo-300">{c.artworkUrl ? <img src={c.artworkUrl} alt="" className="h-full w-full object-cover" /> : <Ticket className="h-3.5 w-3.5" />}</span><span><span className="block text-sm font-semibold text-slate-900">{c.title}</span><span className="block text-[11px] text-slate-400">{c.prizes.length} prize{c.prizes.length === 1 ? "" : "s"}</span></span></Link></TD><TD><Badge tone={campaignTone(c.status)} dot>{label(c.status)}</Badge></TD><TD className="text-xs">{formatDate(c.startsAt)}</TD><TD className="text-xs">{formatDate(c.endsAt)}</TD><TD className="text-right text-xs font-semibold text-slate-800">{c.attempts ?? 0}</TD><TD className={`text-right text-xs font-semibold ${c.winners ? "text-green-600" : "text-slate-800"}`}>{c.winners ?? 0}</TD><TD className="text-right"><DropdownMenu items={[{ label: "View", icon: <Eye className="h-3.5 w-3.5" />, href: `/scratch-win/${c.id}` }, { label: "Edit", icon: <Pencil className="h-3.5 w-3.5" />, href: `/scratch-win/${c.id}/edit` }, { label: c.status === "ACTIVE" ? "Deactivate" : "Activate", icon: <Power className="h-3.5 w-3.5" />, tone: c.status === "ACTIVE" ? "danger" : "default", onSelect: () => toggle(c) }]} /></TD></TR>)}</tbody>
              </Table>
            </Card>
            {meta && meta.totalPages > 1 && <Pagination page={meta.page} pages={meta.totalPages} onChange={setPage} summary={`${meta.total} campaigns`} />}
          </>
        )}
      </QueryState>
    </ScratchShell>
  );
}
