"use client";
import { Button } from "@/components/ui/button";
import { Badge, DotStatus } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Checkbox, Input, Label, Segmented, Select } from "@/components/ui/input";
import { Alert, PageHeader, Stepper, SuccessIcon } from "@/components/ui/misc";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { companies } from "@/lib/data";
import { img } from "@/lib/utils";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Info, Play } from "lucide-react";
import { useState } from "react";

const pool = [
  { id: "l1", name: "Lobby Display 01", location: "Main Lobby", status: "Online", orientation: "Landscape", res: "1920×1080", ok: true },
  { id: "l2", name: "Lobby Display 02", location: "Main Lobby", status: "Online", orientation: "Landscape", res: "1920×1080", ok: true },
  { id: "l3", name: "Lobby Display 03", location: "Main Lobby", status: "Online", orientation: "Landscape", res: "1920×1080", ok: true },
  { id: "en", name: "Entrance Screen N", location: "North Entrance", status: "Online", orientation: "Landscape", res: "1920×1080", ok: true },
  { id: "es", name: "Entrance Screen S", location: "South Entrance", status: "Offline", orientation: "Landscape", res: "1920×1080", ok: true },
  { id: "w1", name: "Window Display 01", location: "Shop Window", status: "Online", orientation: "Portrait", res: "1080×1920", ok: false },
];
const swatches = ["bg-blue-600", "bg-violet-600", "bg-emerald-600", "bg-amber-500", "bg-pink-500"];
const STEPS = ["Select Screens", "Arrange", "Preview", "Activate"];

export function CreateCanvas() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [owner, setOwner] = useState<"customer" | "personal">("customer");
  const [sel, setSel] = useState<string[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [activated, setActivated] = useState(false);

  const selected = order.map((id) => pool.find((p) => p.id === id)!);
  const readyCount = selected.filter((s) => s.status === "Online").length;
  const toggle = (id: string) => setSel((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  const move = (i: number, dir: -1 | 1) => setOrder((o) => { const n = [...o]; const j = i + dir; if (j < 0 || j >= n.length) return o; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const displayName = name || "Mall Enterance";

  return (
    <div className="space-y-5">
      <PageHeader title="Create Synchronized Canvas" subtitle="Follow the steps below to create a new synchronized canvas." action={<Button href="/screens/canvas" variant="secondary">Cancel</Button>} />
      <Stepper steps={STEPS} current={step} />

      {step === 1 && (
        <div className="space-y-5 animate-fade-in">
          <Card className="space-y-4 p-5">
            <div><Label required>Canvas Name</Label><Input placeholder="e.g. Mall Entrance Video Wall" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label required>Owner</Label><Segmented className="max-w-xs" options={[{ value: "customer", label: "Customer Company" }, { value: "personal", label: "Personal Screens" }]} value={owner} onChange={setOwner} /></div>
            {owner === "customer" && <div className="max-w-xs"><Label required>Company</Label><Select defaultValue="acme-retail">{companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></div>}
          </Card>
          <Card>
            <CardHeader title="Select Screens" subtitle="Showing screens for Acme Retail. Select 2 or more to combine." />
            <Table>
              <THead><tr><TH className="w-10"><Checkbox checked={sel.length === pool.filter((p) => p.ok).length} onChange={(v) => setSel(v ? pool.filter((p) => p.ok).map((p) => p.id) : [])} /></TH><TH>Screen Name</TH><TH>Status</TH><TH>Orientation</TH><TH>Resolution</TH></tr></THead>
              <tbody>
                {pool.map((s) => (
                  <TR key={s.id} className={!s.ok ? "opacity-50" : ""}>
                    <TD><Checkbox checked={sel.includes(s.id)} onChange={() => s.ok && toggle(s.id)} /></TD>
                    <TD><div className="flex items-center gap-2 text-sm font-semibold text-slate-900">{s.name}{!s.ok && <Badge tone="amber">Incompatible</Badge>}</div><div className="text-[11px] text-slate-400">{s.location}</div></TD>
                    <TD><DotStatus status={s.status} /></TD>
                    <TD className="text-xs whitespace-nowrap">{s.orientation === "Landscape" ? "↔" : "↕"} {s.orientation}</TD>
                    <TD className="text-xs">{s.res}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </Card>
          <div className="flex justify-between"><Button href="/screens/canvas" variant="secondary">Cancel</Button><Button disabled={sel.length < 2} onClick={() => { setOrder(sel); setStep(2); }}>Continue <ChevronRight className="h-3.5 w-3.5" /></Button></div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 animate-fade-in">
          <Card>
            <CardHeader title="Physical Screen Positions" subtitle="Arrange the screens to match their real physical positions from left to right. Use the arrows to reorder." />
            <div className="space-y-4 p-5">
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${selected.length}, minmax(0,1fr))` }}>
                {selected.map((s, i) => (
                  <div key={s.id} className="overflow-hidden rounded-lg border border-slate-200">
                    <div className="relative aspect-video bg-slate-900"><img src={img(`arr-${s.id}`, 480, 270)} alt="" className="h-full w-full object-cover" /><span className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white ${swatches[i % 5]}`}>#{i + 1}</span></div>
                    <div className="flex items-center justify-between px-3 py-2"><div><div className="text-xs font-semibold text-slate-900">{s.name}</div><div className="text-[10px] text-slate-400">Position {i + 1}</div></div><div className="flex gap-1"><button onClick={() => move(i, -1)} disabled={i === 0} className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 disabled:opacity-30"><ChevronLeft className="h-3 w-3" /></button><button onClick={() => move(i, 1)} disabled={i === selected.length - 1} className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 disabled:opacity-30"><ChevronRight className="h-3 w-3" /></button></div></div>
                  </div>
                ))}
              </div>
              <Alert tone="blue" icon={<Info className="h-3.5 w-3.5 shrink-0" />}>The leftmost screen will display the leftmost portion of the master canvas. Arrange to match the physical installation.</Alert>
            </div>
          </Card>
          <div className="flex justify-between"><Button variant="secondary" onClick={() => setStep(1)}><ArrowLeft className="h-3.5 w-3.5" /> Back</Button><Button onClick={() => setStep(3)}>Continue to Preview <ArrowRight className="h-3.5 w-3.5" /></Button></div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5 animate-fade-in">
          <Card>
            <CardHeader title="Master Canvas Preview" subtitle={`"${displayName}" — content will be split evenly across ${selected.length} screens.`} />
            <div className="p-5">
              <div className="relative overflow-hidden rounded-lg bg-slate-900" style={{ aspectRatio: `${selected.length * 16} / 9`, maxHeight: 220 }}>
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${selected.length}, minmax(0,1fr))` }}>
                  {selected.map((s, i) => <div key={s.id} className="relative border-r border-white/20 last:border-r-0"><span className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white ${swatches[i % 5]}`}>Screen {i + 1}</span></div>)}
                </div>
                <div className="absolute bottom-3 left-3 text-xs font-semibold text-white">{displayName}</div>
              </div>
            </div>
          </Card>
          <Card className="flex items-center justify-between px-5 py-4"><span className="text-sm font-semibold text-slate-900">Screen Readiness</span><span className={`text-xs font-semibold ${readyCount === selected.length ? "text-green-600" : "text-amber-600"}`}>{readyCount} of {selected.length} screens ready</span></Card>
          <div className="flex justify-between"><Button variant="secondary" onClick={() => setStep(2)}><ArrowLeft className="h-3.5 w-3.5" /> Back</Button><Button onClick={() => setStep(4)}>Continue to Activate <ArrowRight className="h-3.5 w-3.5" /></Button></div>
        </div>
      )}

      {step === 4 && !activated && (
        <div className="space-y-5 animate-fade-in">
          <Card>
            <CardHeader title="Activation Summary" />
            <dl className="divide-y divide-slate-100 px-5">
              {[["Canvas Name", displayName], ["Total Screens", `${selected.length} screens`], ["Layout", `${selected.length} × Landscape`], ["Readiness", `${readyCount} of ${selected.length} screens ready`]].map(([k, v]) => <div key={k} className="flex justify-between py-3 text-xs"><dt className="text-slate-400">{k}</dt><dd className="font-semibold text-slate-900">{v}</dd></div>)}
            </dl>
          </Card>
          <Card>
            <CardHeader title="Screen Order" />
            <ol className="divide-y divide-slate-100">{selected.map((s, i) => <li key={s.id} className="flex items-center gap-3 px-5 py-2.5 text-xs"><span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-semibold text-white ${swatches[i % 5]}`}>{i + 1}</span><span className="font-semibold text-slate-900">{s.name}</span><span className="text-slate-400">{s.location}</span></li>)}</ol>
          </Card>
          <div className="flex justify-between"><Button variant="secondary" onClick={() => setStep(3)}><ArrowLeft className="h-3.5 w-3.5" /> Back</Button><Button variant="success" onClick={() => setActivated(true)}><Play className="h-3.5 w-3.5" /> Activate Canvas</Button></div>
        </div>
      )}

      {step === 4 && activated && (
        <Card className="flex flex-col items-center px-6 py-10 text-center animate-fade-in">
          <SuccessIcon />
          <h2 className="mt-4 text-base font-semibold text-slate-900">Canvas Activated</h2>
          <p className="mt-1 text-xs text-slate-600"><span className="font-semibold">{displayName}</span> is now active across {selected.length} synchronized screens.</p>
          <p className="text-[11px] text-slate-400">All screens are synchronizing shared timing. First content sync in progress.</p>
          <Button href="/screens/canvas/mall-enterance" className="mt-5">Go to Canvas <ArrowRight className="h-3.5 w-3.5" /></Button>
        </Card>
      )}
    </div>
  );
}
