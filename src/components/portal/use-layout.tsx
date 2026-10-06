"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { applyApiError, Field, FormError, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { QueryState, Skeleton, TableSkeleton } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { useBindZone, useClearZone, useCreateLayout, useLayout, usePresets, usePublishLayout } from "@/lib/api/hooks/layouts";
import { useMedia } from "@/lib/api/hooks/media";
import { usePlaylists } from "@/lib/api/hooks/playlists";
import type { Layout } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { text } from "@/lib/validation/fields";
import { maskName } from "@/lib/validation/masks";
import { z } from "zod";
import { Check, ImageIcon, ListVideo, Lock, Plus, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NavyZoneDiagram } from "./layouts-page";
import { BackLinkButton } from "./portal-stepper";
import { PublishTarget } from "./publish-target";

type Pick = { kind: "MEDIA" | "PLAYLIST"; id: string; name: string };
const nameSchema = z.object({ name: text(120, 2) });

/** Step 1: name the layout, which creates it from the preset. */
function NameStep({ presetId, companyId, basePath, onCreated }: { presetId: string; companyId?: string | null; basePath: string; onCreated: (l: Layout) => void }) {
  const router = useRouter();
  const presets = usePresets();
  const create = useCreateLayout(companyId);
  const form = useZodForm(nameSchema, { defaultValues: { name: "" } });
  const preset = (presets.data?.data ?? []).find((p) => p.presetId === presetId);
  const submit = form.handleSubmit(async (v) => {
    try { onCreated(await create.mutateAsync({ presetId, name: v.name })); } catch (e) { applyApiError(form, e); }
  });
  return (
    <div className="space-y-4">
      <BackLinkButton label="Layouts" onClick={() => router.push(basePath)} />
      <QueryState query={presets} skeleton={<Skeleton className="h-64 max-w-lg" />}>
        {() => !preset ? <div className="text-sm text-slate-500">Unknown layout preset.</div> : (
          <div className="grid gap-5 xl:grid-cols-[400px_1fr]">
            <div><NavyZoneDiagram zones={preset.zones ?? []} /><div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400"><Lock className="h-3 w-3" /> Zone positions, sizes, and layout geometry are locked.</div></div>
            <form onSubmit={submit} noValidate className="space-y-4">
              <div><h1 className="text-xl font-bold tracking-tight text-slate-900">{preset.name}</h1><p className="text-xs text-slate-400">{(preset.zones ?? []).length} zone{(preset.zones ?? []).length > 1 ? "s" : ""}: {(preset.zones ?? []).map((z) => z.name).join(", ")}</p></div>
              <FormError form={form} />
              <Field label="Layout name" required error={form.formState.errors.name?.message} hint="2–120 characters"><Input placeholder={`e.g. Lobby ${preset.name}`} maxLength={120} autoFocus {...maskedRegister(form, "name", maskName)} /></Field>
              <SubmitButton form={form} pendingText="Creating…">Continue to zones</SubmitButton>
            </form>
          </div>
        )}
      </QueryState>
    </div>
  );
}

/** Step 2: bind media or a playlist to each zone; every zone must be bound before publishing. */
function ZonesStep({ layout, companyId, basePath, onPublish }: { layout: Layout; companyId?: string | null; basePath: string; onPublish: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const bind = useBindZone(companyId);
  const clear = useClearZone(companyId);
  const [picker, setPicker] = useState<number | null>(null);
  const zones = layout.zones ?? [];
  const missing = zones.filter((z) => !z.binding);
  const filled = Object.fromEntries(zones.filter((z) => z.binding).map((z) => [z.index, z.binding!.name]));
  const pick = (index: number, c: Pick) => !bind.isPending && bind.mutate({ id: layout.id, index, bindingKind: c.kind, refId: c.id }, { onSuccess: () => setPicker(null), onError: (e) => toast.error(e, "Couldn't assign content") });
  const unbind = (index: number) => !clear.isPending && clear.mutate({ id: layout.id, index }, { onError: (e) => toast.error(e) });

  return (
    <div className="space-y-4">
      <BackLinkButton label="Layouts" onClick={() => router.push(basePath)} />
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-bold tracking-tight text-slate-900">{layout.name}</h1><p className="text-xs text-slate-400">Assign content to each zone below.</p></div><Button disabled={missing.length > 0} onClick={onPublish}><Send className="h-3.5 w-3.5" /> Publish</Button></div>
      {missing.length > 0 && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">Required zones not yet assigned: {missing.map((z) => z.name).join(", ")}.</div>}
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Layout Preview</div>
          <NavyZoneDiagram zones={zones} filled={filled} className="mt-2" />
          <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500"><Lock className="h-3 w-3" /> Zone positions, sizes, and layout geometry are locked.</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Content Assignment</div>
          <div className="mt-2 space-y-3">
            {zones.map((z) => (
              <Card key={z.index} className="p-4">
                <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-semibold text-slate-900"><span className={cn("h-3 w-3 rounded-sm border-2", z.binding ? "border-blue-600 bg-blue-600" : "border-blue-600")} />{z.name}<span className="text-[10px] font-medium text-red-500">Required</span></span>{z.binding && <span className="flex items-center gap-1 text-[10px] font-medium text-green-600"><Check className="h-3 w-3" /> Assigned</span>}</div>
                {z.binding ? (
                  <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 animate-fade-in"><span className="flex h-8 w-8 items-center justify-center rounded bg-slate-200 text-slate-500">{z.bindingKind === "PLAYLIST" ? <ListVideo className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-900">{z.binding.name}</span><span className="block text-[9px] font-semibold uppercase tracking-wider text-slate-400">{z.bindingKind}</span></span><Button size="sm" variant="secondary" onClick={() => setPicker(z.index)} disabled={clear.isPending}>Replace</Button><button onClick={() => unbind(z.index)} disabled={clear.isPending} className="flex h-7 w-7 items-center justify-center rounded border border-red-200 text-red-500 hover:bg-red-50" aria-label="Clear zone"><X className="h-3.5 w-3.5" /></button></div>
                ) : (
                  <button onClick={() => setPicker(z.index)} className="mt-3 flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 text-xs font-medium text-slate-500 hover:border-blue-300 hover:text-blue-600"><Plus className="h-3.5 w-3.5" /> Select Media or Playlist</button>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
      <AssignContentModal zone={picker === null ? null : zones.find((z) => z.index === picker)?.name ?? null} companyId={companyId} pending={bind.isPending} onClose={() => setPicker(null)} onPick={(c) => picker !== null && pick(picker, c)} />
    </div>
  );
}

function AssignContentModal({ zone, companyId, pending, onClose, onPick }: { zone: string | null; companyId?: string | null; pending: boolean; onClose: () => void; onPick: (c: Pick) => void }) {
  const [tab, setTab] = useState<"media" | "playlist">("media");
  const media = useMedia({ status: "READY", pageSize: 100 }, { companyId, enabled: zone !== null });
  const playlists = usePlaylists({ pageSize: 100 }, { companyId, enabled: zone !== null });
  return (
    <Modal open={zone !== null} onClose={onClose} width="max-w-[480px]">
      <ModalHeader title="Assign Content" subtitle={<>Zone: <span className="font-semibold text-slate-800">{zone}</span></>} onClose={onClose} />
      <div className="px-6 pt-3"><div className="-mb-px flex gap-5 border-b border-slate-200">{(["media", "playlist"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={cn("border-b-2 pb-2 text-xs font-medium capitalize", tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500")}>{t}</button>)}</div></div>
      <div className={cn("max-h-[340px] overflow-y-auto px-6 py-4", pending && "pointer-events-none opacity-50")}>
        {tab === "media" ? (
          <QueryState query={media} skeleton={<TableSkeleton rows={3} />} empty={<p className="text-xs text-slate-400">No ready media yet.</p>}>
            {({ data }) => <div className="grid grid-cols-2 gap-3">{data.map((m) => <button key={m.id} onClick={() => onPick({ kind: "MEDIA", id: m.id, name: m.name })} className="overflow-hidden rounded-lg border border-slate-200 text-left hover:border-blue-300"><span className="flex aspect-video w-full items-center justify-center bg-slate-900 text-slate-500">{m.thumbnailUrl ? <img src={m.thumbnailUrl} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5" />}</span><span className="block truncate px-2 py-1.5 text-[11px] font-medium text-slate-800">{m.name}</span></button>)}</div>}
          </QueryState>
        ) : (
          <QueryState query={playlists} skeleton={<TableSkeleton rows={3} />} empty={<p className="text-xs text-slate-400">No playlists yet.</p>}>
            {({ data }) => data.every((p) => !p.itemCount) ? <p className="text-xs text-slate-400">Your playlists are empty. Add items to a playlist first.</p> : <ul className="space-y-2">{data.filter((p) => p.itemCount > 0).map((p) => <li key={p.id}><button onClick={() => onPick({ kind: "PLAYLIST", id: p.id, name: p.name })} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-left hover:border-blue-300"><span className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-slate-500"><ListVideo className="h-4 w-4" /></span><span><span className="block text-xs font-semibold text-slate-900">{p.name}</span><span className="block text-[10px] text-slate-400">{p.itemCount} items</span></span></button></li>)}</ul>}
          </QueryState>
        )}
      </div>
      <div className="px-6 pb-5"><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button></div>
    </Modal>
  );
}

/**
 * Use-layout flow: `id` is a preset id (`full-screen`, …) to start a new layout, or an existing
 * layout id (from the API) to continue editing one.
 */
export function PortalUseLayout({ id, companyId, basePath = "/portal/layouts" }: { id: string; companyId?: string | null; basePath?: string }) {
  const router = useRouter();
  const isPreset = /^[a-z-]+$/.test(id);
  const [layoutId, setLayoutId] = useState<string | null>(isPreset ? null : id);
  const [phase, setPhase] = useState<"configure" | "publish">("configure");
  const layout = useLayout(layoutId ?? "", { companyId, enabled: !!layoutId });
  const publish = usePublishLayout(companyId);

  if (!layoutId) return <NameStep presetId={id} companyId={companyId} basePath={basePath} onCreated={(l) => setLayoutId(l.id)} />;
  if (phase === "publish" && layout.data) return <PublishTarget subject={layout.data.name} companyId={companyId} onPublish={(sel) => publish.mutateAsync({ id: layout.data!.id, ...sel })} onBack={() => setPhase("configure")} onDone={() => router.push(basePath)} />;
  return <QueryState query={layout} skeleton={<div className="grid gap-5 xl:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>}>{(l) => <ZonesStep layout={l} companyId={companyId} basePath={basePath} onPublish={() => setPhase("publish")} />}</QueryState>;
}
