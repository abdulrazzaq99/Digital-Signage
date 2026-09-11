"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Alert, Avatar, BackLink } from "@/components/ui/misc";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { winners, type Campaign } from "@/lib/data";
import { img } from "@/lib/utils";
import { AlertTriangle, Gift, Lock, Pencil, Power, Star, Tag, Target } from "lucide-react";
import { useState } from "react";
import { ScratchShell, campaignTone } from "./scratch-shell";

export function CampaignDetail({ c }: { c: Campaign }) {
  const [deact, setDeact] = useState(false);
  const totalPrizes = c.prizes.reduce((a, p) => a + p.qty, 0);
  const awarded = c.prizes.reduce((a, p) => a + p.awarded, 0);
  return (
    <ScratchShell tab="campaigns" compact>
      <BackLink href="/scratch-win" label="Scratch & Win" current={c.title} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3"><img src={img(c.seed, 96, 96)} alt="" className="h-11 w-11 rounded-lg object-cover" /><div><h1 className="text-xl font-bold tracking-tight text-slate-900">{c.title}</h1><Badge tone={campaignTone(c.status)} dot className="mt-1">{c.status}</Badge></div></div>
        <div className="flex gap-2"><Button href={`/scratch-win/${c.id}/edit`} variant="secondary"><Pencil className="h-3.5 w-3.5" /> Edit Campaign</Button>{c.status === "Active" && <Button variant="warning-outline" onClick={() => setDeact(true)}><Power className="h-3.5 w-3.5" /> Deactivate</Button>}</div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[["Total Attempts", c.attempts, <Target key="1" className="h-4 w-4" />, "text-blue-500"], ["Total Winners", c.winners, <Star key="2" className="h-4 w-4" />, "text-green-500"], ["Total Prizes", totalPrizes, <Tag key="3" className="h-4 w-4" />, "text-violet-500"], ["Prizes Remaining", totalPrizes - awarded, <Gift key="4" className="h-4 w-4" />, "text-amber-500"]].map(([l, v, i, cls]) => <Card key={String(l)} className="px-5 py-4"><div className="flex items-center justify-between text-xs text-slate-500">{l}<span className={String(cls)}>{i}</span></div><div className="mt-2 text-2xl font-bold text-slate-900">{v}</div></Card>)}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <Card><CardHeader title="Campaign Information" /><dl className="divide-y divide-slate-100 px-5 text-xs">{[["Title", c.title], ["Description", c.description], ["Start Date", c.start || "—"], ["End Date", c.end || "—"], ["Created", c.created], ["Updated", c.updated]].map(([k, v]) => <div key={k} className="flex justify-between gap-8 py-3"><dt className="shrink-0 text-slate-400">{k}</dt><dd className="text-right font-semibold text-slate-800">{v}</dd></div>)}</dl></Card>
          <Card><CardHeader title="Eligibility & Prerequisites" /><dl className="divide-y divide-slate-100 px-5 text-xs"><div className="flex justify-between py-3"><dt className="text-slate-400">Max Attempts / User</dt><dd className="font-semibold text-slate-800">{c.maxAttempts} attempts</dd></div><div className="flex justify-between py-3"><dt className="text-slate-400">Requires Offers Visit</dt><dd className={`font-semibold ${c.requireOffers ? "text-green-600" : "text-slate-800"}`}>{c.requireOffers ? "Yes" : "No"}</dd></div></dl><div className="px-5 pb-4"><Alert tone="blue" icon={<Lock className="h-3.5 w-3.5 shrink-0" />}>Eligibility and attempt limits are validated server-side on every scratch request. Duplicate attempts, replays, and race conditions cannot create additional entries.</Alert></div></Card>
          <Card><CardHeader title="Prize Inventory" /><Table><THead><tr><TH>Prize</TH><TH className="text-right">Initial Qty</TH><TH className="text-right">Awarded</TH><TH className="text-right">Remaining</TH></tr></THead><tbody>{c.prizes.map((p) => <TR key={p.name}><TD><span className="flex items-center gap-2 text-xs font-semibold text-slate-900"><span className="h-1.5 w-1.5 rounded-full bg-blue-600" />{p.name}</span></TD><TD className="text-right text-xs">{p.qty}</TD><TD className="text-right text-xs">{p.awarded}</TD><TD className="text-right text-xs font-semibold text-green-600">{p.qty - p.awarded}</TD></TR>)}</tbody></Table><div className="px-5 pb-4 pt-2"><Alert tone="blue" icon={<Lock className="h-3.5 w-3.5 shrink-0" />}>Remaining quantity is updated atomically by the server. Prize inventory never falls below zero regardless of concurrent requests or network retries.</Alert></div></Card>
        </div>
        <Card className="self-start"><CardHeader title={`Recent Winners (${winners.length})`} /><ul className="divide-y divide-slate-100">{winners.slice(0, 5).map((w) => <li key={w.id} className="flex items-center justify-between px-5 py-2.5"><span className="flex items-center gap-2.5"><Avatar name={w.name} size="sm" className="bg-blue-600" /><span><span className="block text-xs font-semibold text-slate-900">{w.name}</span><span className="block text-[10px] text-slate-400">{w.prize}</span></span></span><Badge tone={w.redemption === "Redeemed" ? "green" : "amber"} dot>{w.redemption}</Badge></li>)}</ul><div className="px-4 pb-4 pt-2"><Button href="/scratch-win?tab=winners" variant="secondary" className="w-full">View All {winners.length} Winners</Button></div></Card>
      </div>
      <Modal open={deact} onClose={() => setDeact(false)} width="max-w-[420px]"><div className="p-6"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600"><AlertTriangle className="h-4 w-4" /></div><h2 className="mt-4 text-base font-semibold text-slate-900">Deactivate Campaign</h2><p className="mt-1.5 text-xs leading-5 text-slate-500">Deactivating <span className="font-semibold text-slate-800">&quot;{c.title}&quot;</span> will immediately stop new scratch card attempts. Existing winners are unaffected. You can reactivate this campaign at any time.</p><div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={() => setDeact(false)}>Cancel</Button><Button className="bg-amber-500 hover:bg-amber-600" onClick={() => setDeact(false)}>Deactivate</Button></div></div></Modal>
    </ScratchShell>
  );
}
