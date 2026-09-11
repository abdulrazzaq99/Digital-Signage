"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FilterSelect, PillTabs, SearchInput } from "@/components/ui/input";
import { Alert, Avatar, Drawer, DropdownMenu } from "@/components/ui/misc";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { campaigns, winners, type CampaignStatus, type Winner } from "@/lib/data";
import { img } from "@/lib/utils";
import { Check, Eye, Lock, Pencil, Power, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ScratchShell, campaignTone, prizeTone } from "./scratch-shell";

export function CampaignsPage({ tab }: { tab: "campaigns" | "winners" }) {
  const [filter, setFilter] = useState<"All" | CampaignStatus>("All");
  const [q, setQ] = useState("");
  const [winner, setWinner] = useState<Winner | null>(null);
  const [redeemed, setRedeemed] = useState<string[]>([]);
  const list = campaigns.filter((c) => (filter === "All" || c.status === filter) && c.title.toLowerCase().includes(q.toLowerCase()));
  const status = (w: Winner) => (redeemed.includes(w.id) ? "Redeemed" : w.redemption);

  if (tab === "winners") {
    return (
      <ScratchShell tab="winners">
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><SearchInput placeholder="Search winners..." className="w-56" /><FilterSelect label="Summer Lucky Draw 2026" /><FilterSelect label="All Companies" /><FilterSelect label="All Prizes" /><FilterSelect label="All Statuses" /></div><span className="text-xs text-slate-400">{winners.length} winners</span></div>
        <Card>
          <Table>
            <THead><tr><TH>User</TH><TH>Company</TH><TH>Campaign</TH><TH>Prize</TH><TH>Won At</TH><TH>Redemption</TH></tr></THead>
            <tbody>{winners.map((w) => <TR key={w.id} className="cursor-pointer" onClick={() => setWinner(w)}><TD><div className="flex items-center gap-3"><Avatar name={w.name} size="sm" className="bg-blue-600" /><div><div className="text-sm font-semibold text-slate-900">{w.name}</div><div className="text-[11px] text-slate-400">{w.email}</div></div></div></TD><TD className="text-xs font-medium text-slate-800">{w.company}</TD><TD className="text-xs">{w.campaign}</TD><TD><Badge tone={prizeTone(w.prize)}>{w.prize}</Badge></TD><TD className="text-xs text-slate-500 whitespace-nowrap">{w.wonAt}</TD><TD><Badge tone={status(w) === "Redeemed" ? "green" : "amber"} dot>{status(w)}</Badge></TD></TR>)}</tbody>
          </Table>
        </Card>
        <Drawer open={!!winner} onClose={() => setWinner(null)}>
          {winner && (
            <>
              <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4"><div><div className="text-sm font-semibold text-slate-900">Winner Detail</div><div className="text-[11px] text-slate-400">Prize redemption management</div></div><button onClick={() => setWinner(null)} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-400"><X className="h-3.5 w-3.5" /></button></div>
              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3"><Avatar name={winner.name} size="lg" className="bg-blue-600" /><div><div className="text-sm font-semibold text-slate-900">{winner.name}</div><div className="text-[11px] text-slate-400">{winner.email}</div><div className="text-[11px] text-slate-400">{winner.company}</div></div></div>
                <dl className="divide-y divide-slate-100 text-xs">{[["Campaign", winner.campaign], ["Prize Won", <span key="p" className="text-blue-600">{winner.prize}</span>], ["Won At", winner.wonAt], ["Company", winner.company], ["Redemption", <Badge key="r" tone={status(winner) === "Redeemed" ? "green" : "amber"} dot>{status(winner)}</Badge>]].map(([k, v]) => <div key={String(k)} className="flex items-center justify-between py-2.5"><dt className="text-slate-400">{k}</dt><dd className="font-semibold text-slate-800">{v}</dd></div>)}</dl>
                <Alert tone="blue" icon={<Lock className="h-3.5 w-3.5 shrink-0" />}>Redemption is recorded server-side. Marking as redeemed is permanent and idempotent — the same redemption cannot be recorded twice.</Alert>
                {status(winner) === "Pending" ? <Button className="w-full" onClick={() => setRedeemed((r) => [...r, winner.id])}><Check className="h-3.5 w-3.5" /> Mark as Redeemed</Button> : <Button variant="secondary" className="w-full" disabled><Check className="h-3.5 w-3.5" /> Already Redeemed</Button>}
              </div>
            </>
          )}
        </Drawer>
      </ScratchShell>
    );
  }

  return (
    <ScratchShell tab="campaigns">
      <div className="flex flex-wrap items-center gap-3"><SearchInput placeholder="Search campaigns..." className="w-64" value={q} onChange={(e) => setQ(e.target.value)} /><PillTabs options={(["All", "Active", "Scheduled", "Draft", "Ended", "Inactive"] as const).map((v) => ({ value: v, label: v }))} value={filter} onChange={setFilter} /></div>
      <Card>
        <Table>
          <THead><tr><TH>Campaign</TH><TH>Status</TH><TH>Start Date</TH><TH>End Date</TH><TH className="text-right">Attempts</TH><TH className="text-right">Winners</TH><TH className="text-right">Actions</TH></tr></THead>
          <tbody>{list.map((c) => <TR key={c.id}><TD><Link href={`/scratch-win/${c.id}`} className="flex items-center gap-3"><img src={img(c.seed, 96, 64)} alt="" className="h-8 w-12 rounded object-cover" /><span><span className="block text-sm font-semibold text-slate-900">{c.title}</span><span className="block text-[11px] text-slate-400">{c.prizes.length} prizes</span></span></Link></TD><TD><Badge tone={campaignTone(c.status)} dot>{c.status}</Badge></TD><TD className="text-xs">{c.start || "—"}</TD><TD className="text-xs">{c.end || "—"}</TD><TD className="text-right text-xs font-semibold text-slate-800">{c.attempts}</TD><TD className={`text-right text-xs font-semibold ${c.winners ? "text-green-600" : "text-slate-800"}`}>{c.winners}</TD><TD className="text-right"><DropdownMenu items={[{ label: "View", icon: <Eye className="h-3.5 w-3.5" />, href: `/scratch-win/${c.id}` }, { label: "Edit", icon: <Pencil className="h-3.5 w-3.5" />, href: `/scratch-win/${c.id}/edit` }, { label: c.status === "Active" ? "Deactivate" : "Activate", icon: <Power className="h-3.5 w-3.5" />, tone: c.status === "Active" ? "danger" : "default" }]} /></TD></TR>)}</tbody>
        </Table>
      </Card>
    </ScratchShell>
  );
}
