"use client";
import { Button } from "@/components/ui/button";
import { Badge, DotStatus } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/input";
import { Alert, Breadcrumb, Stepper } from "@/components/ui/misc";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import type { Canvas } from "@/lib/data";
import { img } from "@/lib/utils";
import { AlertTriangle, ArrowLeft, Check, CheckCircle2, ChevronLeft, ChevronRight, Plus, RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const swatches = ["bg-blue-600", "bg-violet-600", "bg-emerald-600"];
const STEPS = ["Screens", "Arrangement", "Content & Preview", "Review & Apply"];

export function ReconfigureCanvas({ canvas }: { canvas: Canvas }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [members, setMembers] = useState(canvas.members.map((m) => m.name));
  const move = (i: number, dir: -1 | 1) => setMembers((o) => { const n = [...o]; const j = i + dir; if (j < 0 || j >= n.length) return o; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const info = (name: string) => canvas.members.find((m) => m.name === name)!;

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: canvas.name, href: `/screens/canvas/${canvas.id}` }, { label: "Reconfigure" }]} />
      <div><h1 className="text-xl font-bold tracking-tight text-slate-900">Reconfigure Canvas</h1><p className="mt-1 text-sm text-slate-400">Update screens, physical arrangement, or canvas content.</p></div>
      <Alert tone="green" icon={<CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}>The current canvas remains active until the updated configuration is applied and all screens are ready.</Alert>
      <Stepper steps={STEPS} current={step} />

      {step === 1 && (
        <div className="space-y-5 animate-fade-in">
          <Card>
            <CardHeader title="Selected Screens" subtitle="Minimum 2 screens required. Remove or add compatible screens." action={<div className="flex items-center gap-2"><Badge tone="blue">{members.length} screens</Badge><Button size="sm"><Plus className="h-3.5 w-3.5" /> Add Screen</Button></div>} />
            <Table>
              <THead><tr><TH className="w-10"> </TH><TH>Screen</TH><TH>Status</TH><TH>Orientation</TH><TH>Resolution</TH><TH> </TH></tr></THead>
              <tbody>
                {members.map((n) => (
                  <TR key={n}>
                    <TD><Checkbox /></TD>
                    <TD><div className="text-sm font-semibold text-slate-900">{n}</div><div className="text-[11px] text-slate-400">{info(n).location}</div></TD>
                    <TD><DotStatus status={info(n).status} /></TD>
                    <TD className="text-xs whitespace-nowrap">↔ Landscape</TD>
                    <TD className="text-xs">1920×1080</TD>
                    <TD className="text-right"><button onClick={() => members.length > 2 && setMembers((m) => m.filter((x) => x !== n))} className="flex h-6 w-6 items-center justify-center rounded border border-red-200 text-red-500 hover:bg-red-50" aria-label="Remove"><X className="h-3 w-3" /></button></TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </Card>
          <div className="flex justify-between"><Button variant="secondary" onClick={() => router.push(`/screens/canvas/${canvas.id}`)}>Cancel</Button><Button onClick={() => setStep(2)}>Continue <ChevronRight className="h-3.5 w-3.5" /></Button></div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 animate-fade-in">
          <Card>
            <CardHeader title="Physical Arrangement" subtitle="Drag to reorder, or use the Move Left / Right controls. Screens are displayed left-to-right." />
            <div className="p-5">
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${members.length}, minmax(0,1fr))` }}>
                {members.map((n, i) => (
                  <div key={n} className="overflow-hidden rounded-lg border border-slate-200">
                    <div className="relative aspect-video bg-slate-900"><img src={img(`${canvas.seed}-${i}`, 480, 270)} alt="" className="h-full w-full object-cover" /><span className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white ${swatches[i % 3]}`}>#{i + 1}</span></div>
                    <div className="px-3 py-2"><div className="text-xs font-semibold text-slate-900">{n}</div><div className="text-[10px] text-slate-400">Position {i + 1}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <Table>
              <THead><tr><TH>Pos</TH><TH>Screen</TH><TH>Status</TH><TH>Orientation</TH><TH>Resolution</TH><TH>Move</TH></tr></THead>
              <tbody>
                {members.map((n, i) => (
                  <TR key={n}>
                    <TD><span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-semibold text-white ${swatches[i % 3]}`}>{i + 1}</span></TD>
                    <TD><div className="text-sm font-semibold text-slate-900">{n}</div><div className="text-[11px] text-slate-400">{info(n).location}</div></TD>
                    <TD><DotStatus status={info(n).status} /></TD>
                    <TD className="text-xs whitespace-nowrap">↔ Landscape</TD>
                    <TD className="text-xs">1920×1080</TD>
                    <TD><div className="flex gap-1"><button onClick={() => move(i, -1)} disabled={i === 0} className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 disabled:opacity-30"><ChevronLeft className="h-3 w-3" /></button><button onClick={() => move(i, 1)} disabled={i === members.length - 1} className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 disabled:opacity-30"><ChevronRight className="h-3 w-3" /></button></div></TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </Card>
          <div className="flex justify-between"><Button variant="secondary" onClick={() => setStep(1)}><ArrowLeft className="h-3.5 w-3.5" /> Back</Button><Button onClick={() => setStep(3)}>Continue <ChevronRight className="h-3.5 w-3.5" /></Button></div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5 animate-fade-in">
          <Card>
            <CardHeader title="Assigned Content" />
            <div className="flex items-center gap-3 px-5 py-4"><img src={img(canvas.seed ?? "c", 96, 64)} alt="" className="h-8 w-12 rounded object-cover" /><div><div className="text-sm font-semibold text-slate-900">{canvas.content}</div><div className="text-[11px] text-slate-400">Currently assigned · Playlist</div></div></div>
          </Card>
          <Card>
            <CardHeader title="Master Canvas Preview" subtitle={`Content is split evenly across ${members.length} physical screens.`} />
            <div className="space-y-4 p-5">
              <div className="relative overflow-hidden rounded-lg bg-slate-900" style={{ aspectRatio: `${members.length * 16} / 9`, maxHeight: 220 }}>
                <img src={img(`${canvas.seed}-wide`, 1600, 400)} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${members.length}, minmax(0,1fr))` }}>{members.map((n, i) => <div key={n} className="relative border-r border-white/40 last:border-r-0"><span className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white ${swatches[i % 3]}`}>Screen {i + 1}</span></div>)}</div>
                <div className="absolute bottom-3 left-3 text-xs font-semibold text-white">{canvas.content}</div>
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${members.length}, minmax(0,1fr))` }}>
                {members.map((n, i) => (
                  <div key={n} className="overflow-hidden rounded-lg border border-slate-200">
                    <div className="relative aspect-video bg-slate-900"><img src={img(`${canvas.seed}-${i}`, 480, 270)} alt="" className="h-full w-full object-cover" /><span className={`absolute left-2 top-2 flex h-4 w-4 items-center justify-center rounded text-[9px] font-semibold text-white ${swatches[i % 3]}`}>{i + 1}</span></div>
                    <div className="px-3 py-2"><div className="text-xs font-semibold text-slate-900">{n}</div><div className="text-[10px] text-slate-400">Screen {i + 1}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <div className="flex justify-between"><Button variant="secondary" onClick={() => setStep(2)}><ArrowLeft className="h-3.5 w-3.5" /> Back</Button><Button onClick={() => setStep(4)}>Continue <ChevronRight className="h-3.5 w-3.5" /></Button></div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5 animate-fade-in">
          <Card>
            <CardHeader title="Summary of Changes" />
            <div className="flex items-center gap-3 px-5 py-4 text-xs"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600"><RefreshCw className="h-3 w-3" /></span><span className="font-semibold text-slate-900">Content changed —</span><span className="text-slate-600">{canvas.content} → New Campaign 2026</span></div>
          </Card>
          <Alert tone="amber" icon={<AlertTriangle className="h-3.5 w-3.5 shrink-0" />}>Current canvas remains active until the updated configuration is ready. Applying will start a synchronization process across all member screens.</Alert>
          <div className="flex justify-between"><Button variant="secondary" onClick={() => setStep(3)}><ArrowLeft className="h-3.5 w-3.5" /> Back</Button><div className="flex gap-2"><Button variant="secondary" href={`/screens/canvas/${canvas.id}`}>Cancel</Button><Button variant="success" onClick={() => router.push(`/screens/canvas/${canvas.id}`)}><Check className="h-3.5 w-3.5" /> Apply Changes</Button></div></div>
        </div>
      )}
    </div>
  );
}
