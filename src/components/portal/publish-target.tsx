"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SuccessIcon } from "@/components/ui/misc";
import { portalGroups, portalScreens } from "@/lib/portal-data";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { useState } from "react";
import { BackLinkButton } from "./portal-stepper";

type Target = { kind: "screen" | "group"; id: string };

export function PublishTarget({ subject, onBack, onDone }: { subject: string; onBack: () => void; onDone: () => void }) {
  const [target, setTarget] = useState<Target>({ kind: "screen", id: "reception-display" });
  const [phase, setPhase] = useState<"select" | "confirm" | "done">("select");
  const affected = target.kind === "screen" ? portalScreens.filter((s) => s.id === target.id) : portalScreens.filter((s) => portalGroups.find((g) => g.id === target.id)?.screenIds.includes(s.id));
  const targetName = target.kind === "screen" ? affected[0]?.name : portalGroups.find((g) => g.id === target.id)?.name;
  const Radio = ({ on }: { on: boolean }) => <span className={cn("flex h-4 w-4 items-center justify-center rounded-full border", on ? "border-blue-600" : "border-slate-300")}>{on && <span className="h-2 w-2 rounded-full bg-blue-600" />}</span>;

  if (phase === "done") {
    return (
      <div className="flex max-w-[480px] flex-col items-center pt-6 text-center animate-fade-in">
        <SuccessIcon /><h1 className="mt-4 text-base font-semibold text-slate-900">Published!</h1><p className="text-xs text-slate-400">Content is live on your screens.</p>
        <ul className="mt-5 w-full space-y-2">{affected.map((s) => <li key={s.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs"><span><span className="block font-semibold text-slate-900">{s.name}</span>{s.status !== "Online" && <span className="block text-[10px] text-slate-400">Update pending — will sync when screen reconnects.</span>}</span><Badge tone={s.status === "Online" ? "green" : "amber"} dot>{s.status === "Online" ? "Synced" : "Pending"}</Badge></li>)}</ul>
        <Button className="mt-4 w-full max-w-[160px]" onClick={onDone}>Done</Button>
      </div>
    );
  }

  if (phase === "confirm") {
    return (
      <div className="max-w-[480px] space-y-4 animate-fade-in">
        <BackLinkButton label="Select Target" onClick={() => setPhase("select")} />
        <div><h1 className="text-xl font-bold tracking-tight text-slate-900">Confirm Publish</h1><p className="text-xs text-slate-400">Publishing <span className="font-semibold text-slate-700">{subject}</span> to <span className="font-semibold text-slate-700">{targetName}</span></p></div>
        <ul className="space-y-1.5">{affected.map((s) => <li key={s.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs"><span className="flex items-center gap-2"><span className={cn("h-2 w-2 rounded-full", s.status === "Online" ? "bg-green-500" : "bg-slate-300")} /><span><span className="block font-semibold text-slate-900">{s.name}</span><span className="block text-[10px] text-slate-400">{s.location}</span></span></span>{s.status !== "Online" && <span className="text-[10px] italic text-slate-400">Will sync when online</span>}</li>)}</ul>
        <div className="flex gap-2"><Button variant="secondary" onClick={() => setPhase("select")}>Back</Button><Button onClick={() => setPhase("done")}><Send className="h-3.5 w-3.5" /> Publish Now</Button></div>
      </div>
    );
  }

  return (
    <div className="max-w-[520px] space-y-4 animate-fade-in">
      <BackLinkButton label="Back" onClick={onBack} />
      <div><h1 className="text-xl font-bold tracking-tight text-slate-900">Publish — {subject}</h1><p className="text-xs text-slate-400">Choose a screen or group to publish to.</p></div>
      <Card className="p-4">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Screens</div>
        <ul className="mt-2 space-y-1.5">{portalScreens.map((s) => { const on = target.kind === "screen" && target.id === s.id; return <li key={s.id}><button onClick={() => setTarget({ kind: "screen", id: s.id })} className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left", on ? "border-blue-300 bg-blue-50/40" : "border-slate-200 hover:bg-slate-50")}><span className={cn("h-2 w-2 rounded-full", s.status === "Online" ? "bg-green-500" : s.status === "Offline" ? "bg-slate-300" : "bg-red-500")} /><span className="flex-1"><span className="block text-xs font-semibold text-slate-900">{s.name}</span><span className="block text-[10px] text-slate-400">{s.location}</span></span><Radio on={on} /></button></li>; })}</ul>
        <div className="mt-4 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Groups</div>
        <ul className="mt-2 space-y-1.5">{portalGroups.map((g) => { const on = target.kind === "group" && target.id === g.id; return <li key={g.id}><button onClick={() => setTarget({ kind: "group", id: g.id })} className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left", on ? "border-blue-300 bg-blue-50/40" : "border-slate-200 hover:bg-slate-50")}><span className="flex-1"><span className="block text-xs font-semibold text-slate-900">{g.name}</span><span className="block text-[10px] text-slate-400">{g.screenIds.length} screens</span></span><Radio on={on} /></button></li>; })}</ul>
      </Card>
      <div className="flex gap-2"><Button variant="secondary" onClick={onBack}>Cancel</Button><Button onClick={() => setPhase("confirm")}>Review</Button></div>
    </div>
  );
}
