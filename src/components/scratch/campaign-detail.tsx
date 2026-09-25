"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Alert, Avatar, BackLink } from "@/components/ui/misc";
import { QueryState, Skeleton } from "@/components/ui/query-state";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { campaignTone, useActivateCampaign, useCampaign, useDeactivateCampaign, useWinners } from "@/lib/api/hooks/campaigns";
import type { Campaign, Winner } from "@/lib/api/types";
import { formatDate, formatDateTime, label } from "@/lib/format";
import { AlertTriangle, Gift, Lock, Pencil, Power, Star, Tag, Target, Ticket } from "lucide-react";
import { useState } from "react";
import { WinnerDrawer } from "./campaigns-page";
import { ScratchShell } from "./scratch-shell";

function Detail({ c }: { c: Campaign }) {
  const toast = useToast();
  const winners = useWinners({ campaignId: c.id, pageSize: 5 });
  const activate = useActivateCampaign();
  const deactivate = useDeactivateCampaign();
  const [deact, setDeact] = useState(false);
  const [winner, setWinner] = useState<Winner | null>(null);
  const prizes = c.prizes ?? [];
  const totalPrizes = prizes.reduce((a, p) => a + p.quantity, 0);
  const remaining = prizes.reduce((a, p) => a + p.remaining, 0);
  const doActivate = () => activate.mutate(c.id, { onSuccess: () => toast.success("Campaign activated", c.title), onError: (e) => toast.error(e) });
  const doDeactivate = () => deactivate.mutate(c.id, { onSuccess: () => { toast.success("Campaign deactivated", c.title); setDeact(false); }, onError: (e) => toast.error(e) });
  return (
    <ScratchShell tab="campaigns" compact>
      <BackLink href="/scratch-win" label="Scratch & Win" current={c.title} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-indigo-900 text-indigo-300">{c.artworkUrl ? <img src={c.artworkUrl} alt="" className="h-full w-full object-cover" /> : <Ticket className="h-5 w-5" />}</span><div><h1 className="text-xl font-bold tracking-tight text-slate-900">{c.title}</h1><Badge tone={campaignTone(c.status)} dot className="mt-1">{label(c.status)}</Badge></div></div>
        <div className="flex flex-wrap gap-2"><Button href={`/scratch-win/${c.id}/edit`} variant="secondary"><Pencil className="h-3.5 w-3.5" /> Edit Campaign</Button>{c.status === "ACTIVE" ? <Button variant="warning-outline" onClick={() => setDeact(true)} disabled={deactivate.isPending}><Power className="h-3.5 w-3.5" /> Deactivate</Button> : <Button variant="success" onClick={doActivate} disabled={activate.isPending || prizes.length === 0}><Power className="h-3.5 w-3.5" /> {activate.isPending ? "Activating…" : "Activate"}</Button>}</div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[["Total Attempts", c.attempts ?? 0, <Target key="1" className="h-4 w-4" />, "text-blue-500"], ["Total Winners", c.winners ?? 0, <Star key="2" className="h-4 w-4" />, "text-green-500"], ["Total Prizes", totalPrizes, <Tag key="3" className="h-4 w-4" />, "text-violet-500"], ["Prizes Remaining", remaining, <Gift key="4" className="h-4 w-4" />, "text-amber-500"]].map(([l, v, i, cls]) => <Card key={String(l)} className="px-5 py-4"><div className="flex items-center justify-between text-xs text-slate-500">{l}<span className={String(cls)}>{i}</span></div><div className="mt-2 text-2xl font-bold text-slate-900">{v}</div></Card>)}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <Card><CardHeader title="Campaign Information" /><dl className="divide-y divide-slate-100 px-5 text-xs">{[["Title", c.title], ["Description", c.description || "—"], ["Start Date", formatDateTime(c.startsAt)], ["End Date", formatDateTime(c.endsAt)], ["Created", formatDate(c.createdAt)], ["Updated", formatDate(c.updatedAt)]].map(([k, v]) => <div key={k} className="flex justify-between gap-8 py-3"><dt className="shrink-0 text-slate-400">{k}</dt><dd className="text-right font-semibold text-slate-800">{v}</dd></div>)}</dl></Card>
          <Card><CardHeader title="Eligibility & Prerequisites" /><dl className="divide-y divide-slate-100 px-5 text-xs"><div className="flex justify-between py-3"><dt className="text-slate-400">Max Attempts / User</dt><dd className="font-semibold text-slate-800">{c.maxAttempts} attempt{c.maxAttempts === 1 ? "" : "s"}</dd></div><div className="flex justify-between py-3"><dt className="text-slate-400">Requires Offers Visit</dt><dd className={`font-semibold ${c.requireOffersVisit ? "text-green-600" : "text-slate-800"}`}>{c.requireOffersVisit ? "Yes" : "No"}</dd></div></dl><div className="px-5 pb-4"><Alert tone="blue" icon={<Lock className="h-3.5 w-3.5 shrink-0" />}>Eligibility and attempt limits are validated server-side on every scratch request.</Alert></div></Card>
          <Card><CardHeader title="Prize Inventory" /><Table><THead><tr><TH>Prize</TH><TH>Value</TH><TH className="text-right">Initial Qty</TH><TH className="text-right">Awarded</TH><TH className="text-right">Remaining</TH></tr></THead><tbody>{prizes.map((p) => <TR key={p.id}><TD><span className="flex items-center gap-2 text-xs font-semibold text-slate-900"><span className="h-1.5 w-1.5 rounded-full bg-blue-600" />{p.name}</span></TD><TD className="text-xs">{p.value ?? "—"}</TD><TD className="text-right text-xs">{p.quantity}</TD><TD className="text-right text-xs">{p.awarded}</TD><TD className={`text-right text-xs font-semibold ${p.remaining ? "text-green-600" : "text-slate-400"}`}>{p.remaining}</TD></TR>)}</tbody></Table><div className="px-5 pb-4 pt-2"><Alert tone="blue" icon={<Lock className="h-3.5 w-3.5 shrink-0" />}>Remaining quantity is updated atomically by the server and never falls below zero.</Alert></div></Card>
        </div>
        <Card className="self-start">
          <CardHeader title={`Recent Winners${winners.data?.meta ? ` (${winners.data.meta.total})` : ""}`} />
          <QueryState query={winners} skeleton={<div className="p-4"><Skeleton className="h-24" /></div>} empty={<div className="px-5 py-6 text-center text-xs text-slate-400">No winners yet.</div>}>
            {({ data, meta }) => (
              <>
                <ul className="divide-y divide-slate-100">{data.map((w) => <li key={w.id} className="flex cursor-pointer items-center justify-between px-5 py-2.5 hover:bg-slate-50" onClick={() => setWinner(w)}><span className="flex items-center gap-2.5"><Avatar name={w.user.name} size="sm" className="bg-blue-600" /><span><span className="block text-xs font-semibold text-slate-900">{w.user.name}</span><span className="block text-[10px] text-slate-400">{w.prize.name}</span></span></span><Badge tone={w.redemption === "REDEEMED" ? "green" : "amber"} dot>{label(w.redemption)}</Badge></li>)}</ul>
                <div className="px-4 pb-4 pt-2"><Button href="/scratch-win?tab=winners" variant="secondary" className="w-full">View All {meta?.total ?? data.length} Winners</Button></div>
              </>
            )}
          </QueryState>
        </Card>
      </div>
      <WinnerDrawer winner={winner} onClose={() => setWinner(null)} />
      <Modal open={deact} onClose={() => !deactivate.isPending && setDeact(false)} width="max-w-[420px]"><div className="p-6"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600"><AlertTriangle className="h-4 w-4" /></div><h2 className="mt-4 text-base font-semibold text-slate-900">Deactivate Campaign</h2><p className="mt-1.5 text-xs leading-5 text-slate-500">Deactivating <span className="font-semibold text-slate-800">&quot;{c.title}&quot;</span> immediately stops new scratch attempts. Existing winners are unaffected. You can reactivate it at any time.</p><div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={() => setDeact(false)}>Cancel</Button><Button className="bg-amber-500 hover:bg-amber-600" onClick={doDeactivate} disabled={deactivate.isPending}>{deactivate.isPending ? "Deactivating…" : "Deactivate"}</Button></div></div></Modal>
    </ScratchShell>
  );
}

export function CampaignDetail({ id }: { id: string }) {
  const campaign = useCampaign(id);
  return <QueryState query={campaign} skeleton={<Skeleton className="h-96" />}>{(c) => <Detail c={c} />}</QueryState>;
}
