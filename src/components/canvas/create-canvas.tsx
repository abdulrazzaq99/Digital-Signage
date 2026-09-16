"use client";
import { useCompanyScope } from "@/components/admin/company-scope";
import { Button } from "@/components/ui/button";
import { Badge, DotStatus } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Checkbox, Input, Label, Select } from "@/components/ui/input";
import { Alert, PageHeader, Stepper, SuccessIcon } from "@/components/ui/misc";
import { QueryState } from "@/components/ui/query-state";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { useActivateCanvas, useCreateCanvas, useUpdateCanvas } from "@/lib/api/hooks/canvas";
import { screenStatusLabel, useScreens } from "@/lib/api/hooks/screens";
import type { CanvasSet } from "@/lib/api/types";
import { errorMessage, label } from "@/lib/format";
import { ArrowLeft, ArrowRight, ChevronRight, Info, Play } from "lucide-react";
import { useState } from "react";
import { Arrangement, ContentPicker, MasterPreview, canvasCompatible, swatches } from "./canvas-shared";

const STEPS = ["Select Screens", "Arrange", "Content & Preview", "Activate"];

/**
 * Create → assign content → activate, in one flow. The canvas is only created on the final step so
 * abandoning the wizard leaves nothing behind.
 */
export function CreateCanvas() {
  const scope = useCompanyScope();
  const companyId = scope.companyId;
  const screens = useScreens({ pageSize: 100 }, { companyId, enabled: !!companyId });
  const create = useCreateCanvas(companyId);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [playlistId, setPlaylistId] = useState("");
  const [created, setCreated] = useState<CanvasSet | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = useUpdateCanvas(companyId);
  const activate = useActivateCanvas(companyId);

  const pool = screens.data?.data ?? [];
  const compatible = pool.filter(canvasCompatible);
  const selected = order.map((id) => pool.find((p) => p.id === id)).filter((s): s is NonNullable<typeof s> => !!s);
  const readyCount = selected.filter((s) => s.status === "ONLINE").length;
  const toggle = (id: string) => setSel((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  const move = (i: number, dir: -1 | 1) => setOrder((o) => { const n = [...o]; const j = i + dir; if (j < 0 || j >= n.length) return o; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const displayName = name.trim() || "Untitled canvas";

  /** Creates the canvas, assigns the playlist, then activates. A partial failure leaves a draft the user can finish from the canvas page. */
  const activateCanvas = async () => {
    setBusy(true);
    setError("");
    try {
      const c = await create.mutateAsync({ name: name.trim(), screenIds: order });
      setCreated(c);
      const withContent = await update.mutateAsync({ id: c.id, content: { kind: "PLAYLIST", refId: playlistId } });
      setCreated(withContent);
      setCreated(await activate.mutateAsync(c.id));
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Create Synchronized Canvas" subtitle={`Follow the steps below to create a new synchronized canvas for ${scope.companyName || "the selected company"}.`} action={<Button href={scope.withCompany("/screens/canvas")} variant="secondary">Cancel</Button>} />
      <Stepper steps={STEPS} current={step} />

      {step === 1 && (
        <div className="space-y-5 animate-fade-in">
          <Card className="space-y-4 p-5">
            <div><Label required>Canvas Name</Label><Input placeholder="e.g. Mall Entrance Video Wall" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="max-w-xs"><Label required>Company</Label><Select value={companyId} onChange={(e) => { scope.setCompanyId(e.target.value); setSel([]); }}>{scope.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></div>
          </Card>
          <Card>
            <CardHeader title="Select Screens" subtitle={`Showing screens for ${scope.companyName || "the selected company"}. Select 2 or more landscape screens to combine.`} />
            <QueryState query={screens} empty={<div className="px-5 py-8 text-center text-xs text-slate-400">This company has no paired screens.</div>}>
              {({ data }) => (
                <Table>
                  <THead><tr><TH className="w-10"><Checkbox checked={compatible.length > 0 && compatible.every((p) => sel.includes(p.id))} onChange={(v) => setSel(v ? compatible.map((p) => p.id) : [])} /></TH><TH>Screen Name</TH><TH>Status</TH><TH>Orientation</TH><TH>Resolution</TH></tr></THead>
                  <tbody>
                    {data.map((s) => {
                      const ok = canvasCompatible(s);
                      return (
                        <TR key={s.id} className={!ok ? "opacity-50" : ""}>
                          <TD><Checkbox checked={sel.includes(s.id)} onChange={() => ok && toggle(s.id)} /></TD>
                          <TD><div className="flex items-center gap-2 text-sm font-semibold text-slate-900">{s.name}{!ok && <Badge tone="amber">Incompatible</Badge>}</div><div className="text-[11px] text-slate-400">{s.location ?? "—"}</div></TD>
                          <TD><DotStatus status={screenStatusLabel(s.status)} /></TD>
                          <TD className="text-xs whitespace-nowrap">{s.orientation === "LANDSCAPE" ? "↔" : "↕"} {label(s.orientation)}</TD>
                          <TD className="text-xs">{s.device?.resolution ?? "—"}</TD>
                        </TR>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </QueryState>
          </Card>
          <div className="flex flex-wrap items-center justify-between gap-2"><Button href={scope.withCompany("/screens/canvas")} variant="secondary">Cancel</Button><Button disabled={sel.length < 2 || name.trim().length < 2} onClick={() => { setOrder(sel); setStep(2); }}>Continue <ChevronRight className="h-3.5 w-3.5" /></Button></div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 animate-fade-in">
          <Card>
            <CardHeader title="Physical Screen Positions" subtitle="Arrange the screens to match their real physical positions from left to right." />
            <div className="space-y-4 p-5">
              <Arrangement screens={selected} onMove={move} />
              <Alert tone="blue" icon={<Info className="h-3.5 w-3.5 shrink-0" />}>The leftmost screen displays the leftmost portion of the master canvas. Arrange to match the physical installation.</Alert>
            </div>
          </Card>
          <div className="flex flex-wrap items-center justify-between gap-2"><Button variant="secondary" onClick={() => setStep(1)}><ArrowLeft className="h-3.5 w-3.5" /> Back</Button><Button onClick={() => setStep(3)}>Continue to Content <ArrowRight className="h-3.5 w-3.5" /></Button></div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5 animate-fade-in">
          <ContentPicker companyId={companyId} value={playlistId} onChange={setPlaylistId} />
          <Card>
            <CardHeader title="Master Canvas Preview" subtitle={`"${displayName}" — content is split evenly across ${selected.length} screens.`} />
            <div className="p-5"><MasterPreview count={selected.length} caption={displayName} /></div>
          </Card>
          <Card className="flex items-center justify-between px-5 py-4"><span className="text-sm font-semibold text-slate-900">Screen Readiness</span><span className={`text-xs font-semibold ${readyCount === selected.length ? "text-green-600" : "text-amber-600"}`}>{readyCount} of {selected.length} screens online</span></Card>
          <div className="flex flex-wrap items-center justify-between gap-2"><Button variant="secondary" onClick={() => setStep(2)}><ArrowLeft className="h-3.5 w-3.5" /> Back</Button><Button onClick={() => setStep(4)} disabled={!playlistId}>Continue to Activate <ArrowRight className="h-3.5 w-3.5" /></Button></div>
        </div>
      )}

      {step === 4 && !created && (
        <div className="space-y-5 animate-fade-in">
          <Card>
            <CardHeader title="Activation Summary" />
            <dl className="divide-y divide-slate-100 px-5">
              {[["Canvas Name", displayName], ["Company", scope.companyName], ["Total Screens", `${selected.length} screens`], ["Layout", `${selected.length} × Landscape`], ["Readiness", `${readyCount} of ${selected.length} screens online`]].map(([k, v]) => <div key={k} className="flex justify-between py-3 text-xs"><dt className="text-slate-400">{k}</dt><dd className="font-semibold text-slate-900">{v}</dd></div>)}
            </dl>
          </Card>
          <Card>
            <CardHeader title="Screen Order" />
            <ol className="divide-y divide-slate-100">{selected.map((s, i) => <li key={s.id} className="flex items-center gap-3 px-5 py-2.5 text-xs"><span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-semibold text-white ${swatches[i % swatches.length]}`}>{i + 1}</span><span className="font-semibold text-slate-900">{s.name}</span><span className="text-slate-400">{s.location ?? "—"}</span></li>)}</ol>
          </Card>
          {readyCount < selected.length && <Alert tone="amber">Not every screen is online. The canvas will activate as <span className="font-semibold">degraded</span>; offline screens join when they reconnect.</Alert>}
          {error && <Alert tone="red">{error}</Alert>}
          <div className="flex flex-wrap items-center justify-between gap-2"><Button variant="secondary" onClick={() => setStep(3)} disabled={busy}><ArrowLeft className="h-3.5 w-3.5" /> Back</Button><Button variant="success" onClick={activateCanvas} disabled={busy}><Play className="h-3.5 w-3.5" /> {busy ? "Activating…" : "Create & Activate Canvas"}</Button></div>
        </div>
      )}

      {step === 4 && created && (
        <Card className="flex flex-col items-center px-6 py-10 text-center animate-fade-in">
          <SuccessIcon />
          <h2 className="mt-4 text-base font-semibold text-slate-900">{created.status === "ACTIVE" || created.status === "DEGRADED" ? "Canvas Activated" : "Canvas Created"}</h2>
          <p className="mt-1 text-xs text-slate-600"><span className="font-semibold">{created.name}</span> {created.status === "DEGRADED" ? "is active in degraded mode — some screens are offline." : created.status === "ACTIVE" ? `is active across ${created.members.length} synchronized screens.` : "was created but not activated; you can activate it from the canvas page."}</p>
          {error && <Alert tone="red" className="mt-3">{error}</Alert>}
          <Button href={scope.withCompany(`/screens/canvas/${created.id}`)} className="mt-5">Go to Canvas <ArrowRight className="h-3.5 w-3.5" /></Button>
        </Card>
      )}
    </div>
  );
}
