"use client";
import { useCompanyScope } from "@/components/admin/company-scope";
import { Button } from "@/components/ui/button";
import { Badge, DotStatus, StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { Modal, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { Breadcrumb } from "@/components/ui/misc";
import { QueryState, Skeleton } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { useActivateCanvas, useCanvas, useDeactivateCanvas, useDeleteCanvas } from "@/lib/api/hooks/canvas";
import { usePlaylists } from "@/lib/api/hooks/playlists";
import { useScreens } from "@/lib/api/hooks/screens";
import type { CanvasSet } from "@/lib/api/types";
import { formatDate, formatDateTime, label } from "@/lib/format";
import { LayoutPanelTop, Play, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CompanyGate, QueryBlock } from "@/components/screens/query-guards";
import { Arrangement, MasterPreview, swatches } from "./canvas-shared";

function Detail({ canvas: raw, companyId }: { canvas: CanvasSet; companyId: string }) {
  const canvas = { ...raw, members: raw.members ?? [] };
  const router = useRouter();
  const toast = useToast();
  const scope = useCompanyScope();
  const screens = useScreens({ pageSize: 100 }, { companyId });
  const playlists = usePlaylists({ pageSize: 100 }, { companyId });
  const activate = useActivateCanvas(companyId);
  const deactivate = useDeactivateCanvas(companyId);
  const remove = useDeleteCanvas(companyId);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const members = canvas.members.map((m) => screens.data?.data.find((s) => s.id === m.screenId)).filter((s): s is NonNullable<typeof s> => !!s);
  const online = canvas.members.filter((m) => m.status === "ONLINE").length;
  const contentName = canvas.content ? (canvas.content.kind === "PLAYLIST" ? playlists.data?.data.find((p) => p.id === canvas.content!.refId)?.name : label(canvas.content.kind)) ?? "…" : null;
  const isActive = canvas.status === "ACTIVE" || canvas.status === "DEGRADED";

  const acting = activate.isPending || deactivate.isPending || remove.isPending;
  const doActivate = () => !acting && activate.mutate(canvas.id, { onSuccess: (c) => toast.success(c.status === "DEGRADED" ? "Canvas activated (degraded)" : "Canvas activated", c.status === "DEGRADED" ? "Some screens are offline; they will join when they reconnect." : `Activates at ${formatDateTime(c.activateAt)}`), onError: (e) => toast.error(e, "Couldn't activate") });
  const doDeactivate = () => !acting && deactivate.mutate(canvas.id, { onSuccess: () => toast.success("Canvas deactivated"), onError: (e) => toast.error(e) });
  const doDelete = async () => {
    if (acting) return;
    try { await remove.mutateAsync(canvas.id); toast.success("Canvas deleted"); router.replace(scope.withCompany("/screens/canvas")); } catch (e) { toast.error(e); }
  };

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: "Synchronized Canvas", href: scope.withCompany("/screens/canvas") }, { label: canvas.name }]} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-[72px] items-center justify-center rounded-lg bg-slate-900 text-slate-500"><LayoutPanelTop className="h-5 w-5" /></span>
          <div>
            <div className="flex items-center gap-2.5"><h1 className="text-xl font-bold tracking-tight text-slate-900">{canvas.name}</h1><StatusBadge status={label(canvas.status)} /></div>
            <p className="mt-0.5 text-xs text-slate-400">{canvas.members.length} screens · Created {formatDate(canvas.createdAt)}{canvas.activateAt ? ` · Activates ${formatDateTime(canvas.activateAt)}` : ""}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href={scope.withCompany(`/screens/canvas/${canvas.id}/reconfigure`)} variant="secondary">Reconfigure</Button>
          {isActive ? <Button variant="danger-outline" onClick={doDeactivate} disabled={acting}>{deactivate.isPending ? "Deactivating…" : "Deactivate"}</Button> : <Button variant="success" onClick={doActivate} disabled={acting || !canvas.content} title={!canvas.content ? "Assign content (Reconfigure) before activating" : undefined}><Play className="h-3.5 w-3.5" /> {activate.isPending ? "Activating…" : "Activate"}</Button>}
          <Button variant="danger-outline" onClick={() => setConfirmDelete(true)} disabled={acting} aria-label="Delete canvas"><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={canvas.members.length} label="Total Screens" sub="in this canvas" />
        <StatCard value={online} label="Screens Online" sub={`of ${canvas.members.length}`} tone="green" />
        <StatCard value={canvas.readyCount} label="Ready" sub="for synchronization" tone={canvas.readyCount === canvas.members.length ? "green" : "amber"} />
        <StatCard value={<span className="text-lg">{canvas.members.filter((m) => m.synced).length}</span>} label="Synced" sub="acknowledged the manifest" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Physical Arrangement" />
            <div className="p-5"><QueryBlock query={screens} what="screens" skeleton={<Skeleton className="h-24" />}>{members.length === 0 ? <div className="py-2 text-xs text-slate-400">No screens arranged yet.</div> : <Arrangement screens={members} />}</QueryBlock></div>
          </Card>
          <Card>
            <CardHeader title="Master Canvas" action={<span className="text-[11px] text-slate-400">{contentName ?? "No content assigned"}</span>} />
            <div className="p-5"><MasterPreview count={canvas.members.length} caption={contentName ?? "No content assigned"} thumbnailUrl={members[0]?.assignment?.thumbnailUrl} /></div>
          </Card>
        </div>
        <Card className="self-start">
          <CardHeader title="Member Screens" />
          <ul className="divide-y divide-slate-100">
            {canvas.members.map((m, i) => (
              <li key={m.screenId} className="px-4 py-3">
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-semibold text-white ${swatches[i % swatches.length]}`}>{i + 1}</span><span className="text-sm font-semibold text-slate-900">{m.name}</span></span><DotStatus status={m.status === "ONLINE" ? "Online" : m.status === "OFFLINE" ? "Offline" : "Error"} /></div>
                <div className="mt-1.5 flex items-center gap-2 pl-7">{m.ready ? <Badge tone="green">Ready</Badge> : <Badge tone="amber">Not ready</Badge>}<span className="text-[10px] text-slate-400">{m.synced ? "Synced" : "Awaiting sync"}{m.location ? ` · ${m.location}` : ""}</span></div>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-1.5 border-t border-slate-100 px-4 py-3 text-[11px] text-slate-400"><RefreshCw className="h-3 w-3" /> Status updates live from player presence.</div>
        </Card>
      </div>

      <Modal open={confirmDelete} onClose={() => !remove.isPending && setConfirmDelete(false)} width="max-w-md">
        <ModalHeader title={`Delete "${canvas.name}"?`} subtitle="Member screens keep their own assignments; only the canvas is removed." onClose={() => setConfirmDelete(false)} />
        <ModalFooter><Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button><Button variant="danger" onClick={doDelete} disabled={remove.isPending}>{remove.isPending ? "Deleting…" : "Delete Canvas"}</Button></ModalFooter>
      </Modal>
    </div>
  );
}

export function CanvasDetail({ id }: { id: string }) {
  const scope = useCompanyScope();
  const canvas = useCanvas(id, { companyId: scope.companyId, enabled: !!scope.companyId });
  const skeleton = <div className="space-y-5"><Skeleton className="h-16" /><Skeleton className="h-64" /></div>;
  return <CompanyGate companyId={scope.companyId} skeleton={skeleton} what="this canvas"><QueryState query={canvas} skeleton={skeleton}>{(c) => <Detail canvas={c} companyId={scope.companyId} />}</QueryState></CompanyGate>;
}
