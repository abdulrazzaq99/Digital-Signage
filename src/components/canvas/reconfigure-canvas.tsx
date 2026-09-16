"use client";
import { useCompanyScope } from "@/components/admin/company-scope";
import { Button } from "@/components/ui/button";
import { Badge, DotStatus } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/input";
import { Alert, Breadcrumb, Stepper } from "@/components/ui/misc";
import { QueryState, Skeleton } from "@/components/ui/query-state";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useCanvas, useUpdateCanvas } from "@/lib/api/hooks/canvas";
import { usePlaylists } from "@/lib/api/hooks/playlists";
import { screenStatusLabel, useScreens } from "@/lib/api/hooks/screens";
import type { CanvasSet } from "@/lib/api/types";
import { label } from "@/lib/format";
import { AlertTriangle, ArrowLeft, Check, CheckCircle2, ChevronRight, RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Arrangement, ContentPicker, MasterPreview, canvasCompatible, swatches } from "./canvas-shared";

const STEPS = ["Screens", "Arrangement", "Content & Preview", "Review & Apply"];

function Reconfigure({ canvas, companyId }: { canvas: CanvasSet; companyId: string }) {
  const router = useRouter();
  const toast = useToast();
  const scope = useCompanyScope();
  const screens = useScreens({ pageSize: 100 }, { companyId });
  const playlists = usePlaylists({ pageSize: 100 }, { companyId });
  const update = useUpdateCanvas(companyId);
  const [step, setStep] = useState(1);
  const [members, setMembers] = useState<string[]>(canvas.members.map((m) => m.screenId));
  const [playlistId, setPlaylistId] = useState(canvas.content?.kind === "PLAYLIST" ? canvas.content.refId : "");
  const pool = screens.data?.data ?? [];
  const selected = members.map((id) => pool.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => !!s);
  const addable = pool.filter((s) => canvasCompatible(s) && !members.includes(s.id));
  const move = (i: number, dir: -1 | 1) => setMembers((o) => { const n = [...o]; const j = i + dir; if (j < 0 || j >= n.length) return o; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const back = scope.withCompany(`/screens/canvas/${canvas.id}`);
  const playlistName = (id: string) => playlists.data?.data.find((p) => p.id === id)?.name ?? "—";

  const membersChanged = members.join(",") !== canvas.members.map((m) => m.screenId).join(",");
  const contentChanged = playlistId !== (canvas.content?.kind === "PLAYLIST" ? canvas.content.refId : "");

  const apply = () => update.mutate(
    { id: canvas.id, ...(membersChanged ? { screenIds: members } : {}), ...(contentChanged ? { content: playlistId ? { kind: "PLAYLIST", refId: playlistId } : null } : {}) },
    { onSuccess: () => { toast.success("Canvas updated", "Activate it again to push the new configuration."); router.push(back); }, onError: (e) => toast.error(e, "Couldn't apply changes") },
  );

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: canvas.name, href: back }, { label: "Reconfigure" }]} />
      <div><h1 className="text-xl font-bold tracking-tight text-slate-900">Reconfigure Canvas</h1><p className="mt-1 text-sm text-slate-400">Update screens, physical arrangement, or canvas content.</p></div>
      <Alert tone="green" icon={<CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}>The current canvas keeps running until you apply and re-activate the updated configuration.</Alert>
      <Stepper steps={STEPS} current={step} />

      {step === 1 && (
        <div className="space-y-5 animate-fade-in">
          <Card>
            <CardHeader title="Selected Screens" subtitle="Minimum 2 screens required. Remove members or add compatible screens below." action={<Badge tone="blue">{members.length} screens</Badge>} />
            <Table>
              <THead><tr><TH>Screen</TH><TH>Status</TH><TH>Orientation</TH><TH>Resolution</TH><TH> </TH></tr></THead>
              <tbody>
                {selected.map((s) => (
                  <TR key={s.id}>
                    <TD><div className="text-sm font-semibold text-slate-900">{s.name}</div><div className="text-[11px] text-slate-400">{s.location ?? "—"}</div></TD>
                    <TD><DotStatus status={screenStatusLabel(s.status)} /></TD>
                    <TD className="text-xs whitespace-nowrap">↔ {label(s.orientation)}</TD>
                    <TD className="text-xs">{s.device?.resolution ?? "—"}</TD>
                    <TD className="text-right"><button type="button" onClick={() => members.length > 2 && setMembers((m) => m.filter((x) => x !== s.id))} disabled={members.length <= 2} className="flex h-6 w-6 items-center justify-center rounded border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-30" aria-label="Remove"><X className="h-3 w-3" /></button></TD>
                  </TR>
                ))}
              </tbody>
            </Table>
            {addable.length > 0 && (
              <div className="border-t border-slate-100 px-5 py-4">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Add screens</div>
                <ul className="space-y-1.5">{addable.map((s) => <li key={s.id} className="flex items-center gap-3 text-xs"><Checkbox checked={false} onChange={() => setMembers((m) => [...m, s.id])} /><span className="font-semibold text-slate-900">{s.name}</span><span className="text-slate-400">{s.location ?? "—"}</span><DotStatus status={screenStatusLabel(s.status)} /></li>)}</ul>
              </div>
            )}
          </Card>
          <div className="flex flex-wrap items-center justify-between gap-2"><Button variant="secondary" onClick={() => router.push(back)}>Cancel</Button><Button onClick={() => setStep(2)} disabled={members.length < 2}>Continue <ChevronRight className="h-3.5 w-3.5" /></Button></div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 animate-fade-in">
          <Card>
            <CardHeader title="Physical Arrangement" subtitle="Use the arrows to reorder. Screens are displayed left-to-right." />
            <div className="p-5"><Arrangement screens={selected} onMove={move} /></div>
            <Table>
              <THead><tr><TH>Pos</TH><TH>Screen</TH><TH>Status</TH><TH>Orientation</TH><TH>Resolution</TH></tr></THead>
              <tbody>
                {selected.map((s, i) => (
                  <TR key={s.id}>
                    <TD><span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-semibold text-white ${swatches[i % swatches.length]}`}>{i + 1}</span></TD>
                    <TD><div className="text-sm font-semibold text-slate-900">{s.name}</div><div className="text-[11px] text-slate-400">{s.location ?? "—"}</div></TD>
                    <TD><DotStatus status={screenStatusLabel(s.status)} /></TD>
                    <TD className="text-xs whitespace-nowrap">↔ {label(s.orientation)}</TD>
                    <TD className="text-xs">{s.device?.resolution ?? "—"}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </Card>
          <div className="flex flex-wrap items-center justify-between gap-2"><Button variant="secondary" onClick={() => setStep(1)}><ArrowLeft className="h-3.5 w-3.5" /> Back</Button><Button onClick={() => setStep(3)}>Continue <ChevronRight className="h-3.5 w-3.5" /></Button></div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5 animate-fade-in">
          <ContentPicker companyId={companyId} value={playlistId} onChange={setPlaylistId} />
          <Card>
            <CardHeader title="Master Canvas Preview" subtitle={`Content is split evenly across ${members.length} physical screens.`} />
            <div className="p-5"><MasterPreview count={members.length} caption={playlistId ? playlistName(playlistId) : "No content assigned"} thumbnailUrl={selected[0]?.assignment?.thumbnailUrl} /></div>
          </Card>
          <div className="flex flex-wrap items-center justify-between gap-2"><Button variant="secondary" onClick={() => setStep(2)}><ArrowLeft className="h-3.5 w-3.5" /> Back</Button><Button onClick={() => setStep(4)}>Continue <ChevronRight className="h-3.5 w-3.5" /></Button></div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5 animate-fade-in">
          <Card>
            <CardHeader title="Summary of Changes" />
            <ul className="divide-y divide-slate-100">
              {membersChanged && <li className="flex items-center gap-3 px-5 py-4 text-xs"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600"><RefreshCw className="h-3 w-3" /></span><span className="font-semibold text-slate-900">Screens changed —</span><span className="text-slate-600">{canvas.members.length} → {members.length} screens, order {selected.map((s) => s.name).join(" › ")}</span></li>}
              {contentChanged && <li className="flex items-center gap-3 px-5 py-4 text-xs"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600"><RefreshCw className="h-3 w-3" /></span><span className="font-semibold text-slate-900">Content changed —</span><span className="text-slate-600">{canvas.content ? playlistName(canvas.content.refId) : "None"} → {playlistId ? playlistName(playlistId) : "None"}</span></li>}
              {!membersChanged && !contentChanged && <li className="px-5 py-6 text-center text-xs text-slate-400">No changes yet.</li>}
            </ul>
          </Card>
          <Alert tone="amber" icon={<AlertTriangle className="h-3.5 w-3.5 shrink-0" />}>Applying saves the configuration and returns the canvas to draft. Activate it from the canvas page to start synchronization across the member screens.</Alert>
          <div className="flex flex-wrap items-center justify-between gap-2"><Button variant="secondary" onClick={() => setStep(3)}><ArrowLeft className="h-3.5 w-3.5" /> Back</Button><div className="flex gap-2"><Button variant="secondary" href={back}>Cancel</Button><Button variant="success" onClick={apply} disabled={update.isPending || (!membersChanged && !contentChanged)}><Check className="h-3.5 w-3.5" /> {update.isPending ? "Applying…" : "Apply Changes"}</Button></div></div>
        </div>
      )}
    </div>
  );
}

export function ReconfigureCanvas({ id }: { id: string }) {
  const scope = useCompanyScope();
  const canvas = useCanvas(id, { companyId: scope.companyId, enabled: !!scope.companyId });
  return <QueryState query={canvas} skeleton={<div className="space-y-5"><Skeleton className="h-16" /><Skeleton className="h-64" /></div>}>{(c) => <Reconfigure key={c.id} canvas={c} companyId={scope.companyId} />}</QueryState>;
}
