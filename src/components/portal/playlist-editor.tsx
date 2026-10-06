"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { applyApiError, fieldError, FormError, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { PillTabs, SearchInput } from "@/components/ui/input";
import { QueryState, Skeleton, TableSkeleton } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { useMedia } from "@/lib/api/hooks/media";
import { usePlaylist, useUpdatePlaylist } from "@/lib/api/hooks/playlists";
import type { Media, Playlist } from "@/lib/api/types";
import { fmtClock, label } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Eye, FileText, GripVertical, Pencil, Play, Plus, Save, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import { DURATION_MAX, initialDuration, PLAYLIST_MAX_ITEMS, PLAYLIST_NAME_MAX, playlistEditorSchema, secondsOf, toPlaylistBody, type PlaylistEditorInput } from "@/components/playlists/playlist-schema";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { maskInteger, maskName } from "@/lib/validation/masks";
import { BackLinkButton } from "./portal-stepper";

const typeShort = (t: Media["type"]) => (t === "IMAGE" ? "IMG" : t === "VIDEO" ? "MP4" : "PDF");
const typeTone = (t: Media["type"]) => (t === "IMAGE" ? "blue" : t === "VIDEO" ? "purple" : "red");
const stripExt = (n: string) => n.replace(/\.[a-z0-9]+$/i, "");
const maskDuration = (v: string) => maskInteger(v, 4);

function Thumb({ url, type, className }: { url: string | null; type: Media["type"]; className: string }) {
  if (type === "PDF" && !url) return <span className={cn("flex items-center justify-center rounded bg-orange-50 text-orange-500", className)}><FileText className="h-3.5 w-3.5" /></span>;
  return <span className={cn("relative overflow-hidden rounded bg-slate-900", className)}>{url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-[8px] uppercase text-slate-500">{typeShort(type)}</span>}{type === "VIDEO" && <Play className="absolute inset-0 m-auto h-3 w-3 fill-white text-white" />}</span>;
}

const toEditorValues = (p: Playlist): PlaylistEditorInput => ({
  name: p.name,
  items: (p.items ?? []).map((it) => ({ assetId: it.asset.id, name: it.asset.name, type: it.asset.type as Media["type"], thumbnailUrl: it.asset.thumbnailUrl, duration: String(it.durationSec) })),
});

function Editor({ playlist, companyId, basePath, query }: { playlist: Playlist; companyId?: string | null; basePath: string; query: string }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdatePlaylist(playlist.id, companyId);
  const form = useZodForm(playlistEditorSchema, { defaultValues: toEditorValues(playlist) });
  const { fields, append, remove, move: moveRow } = useFieldArray({ control: form.control, name: "items", keyName: "key" });
  const [editingName, setEditingName] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "IMG" | "VID" | "PDF">("ALL");
  const [q, setQ] = useState("");
  const search = useDebouncedValue(q.trim(), 300);
  const [cur, setCur] = useState(0);
  const library = useMedia({ status: "READY", pageSize: 100, search: search || undefined, type: filter === "ALL" ? undefined : filter === "IMG" ? "IMAGE" : filter === "VID" ? "VIDEO" : "PDF" }, { companyId });
  const items = useWatch({ control: form.control, name: "items" }) ?? [];
  const name = useWatch({ control: form.control, name: "name" }) ?? "";
  const nameReg = maskedRegister(form, "name", maskName);
  const busy = form.formState.isSubmitting;
  const dirty = form.formState.isDirty;
  const nameError = fieldError(form, "name");
  const listError = form.formState.errors.items?.root?.message ?? form.formState.errors.items?.message;
  const total = items.reduce((a, b) => a + secondsOf(b?.duration ?? ""), 0);
  const full = fields.length >= PLAYLIST_MAX_ITEMS;
  const add = (m: Media) => { if (!full) append({ assetId: m.id, name: m.name, type: m.type, thumbnailUrl: m.thumbnailUrl, duration: initialDuration(m) }); };
  const move = (i: number, d: -1 | 1) => { const j = i + d; if (j >= 0 && j < fields.length) moveRow(i, j); };
  const previewRow = items[Math.min(cur, Math.max(items.length - 1, 0))];
  const qs = query ? `?${query}` : "";

  /** Saves, then optionally navigates. Invalid rows keep the user here with the errors shown. */
  const saveThen = (then?: string) => form.handleSubmit(async (v) => {
    try {
      await update.mutateAsync(toPlaylistBody(v));
      form.reset(v);
      toast.success("Playlist saved");
      if (then) router.push(then);
    } catch (e) { applyApiError(form, e); }
  }, (errs) => { if (errs.name) setEditingName(true); toast.error(new Error("Fix the highlighted fields before saving."), "Couldn't save playlist"); });

  // Preview and Publish read the saved playlist, so unsaved edits are saved first (a stale version is never published).
  const go = (sub: string) => { const href = `${basePath}/${playlist.id}/${sub}${qs}`; if (dirty) void saveThen(href)(); else router.push(href); };

  return (
    <form onSubmit={saveThen()} noValidate className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <BackLinkButton label="Playlists" onClick={() => router.push(`${basePath}${qs}`)} />
          <div>
            {editingName || nameError ? (
              <input autoFocus aria-label="Playlist name" aria-invalid={nameError ? true : undefined} maxLength={PLAYLIST_NAME_MAX} disabled={busy} {...nameReg} onBlur={(e) => { void nameReg.onBlur(e); setEditingName(false); }} className="h-7 rounded border border-slate-200 px-2 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 aria-invalid:border-red-400" />
            ) : <button type="button" onClick={() => setEditingName(true)} className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 hover:text-blue-600">{name}<Pencil className="h-3 w-3 text-slate-400" /></button>}
            {nameError && <p role="alert" className="mt-1 text-[11px] font-medium text-red-600">Name: {nameError}</p>}
          </div>
          {dirty && <Badge tone="amber">Unsaved</Badge>}
        </div>
        <div className="flex flex-wrap gap-2">
          <SubmitButton form={form} variant="secondary" size="sm" disabled={!dirty}><Save className="h-3.5 w-3.5" /> Save</SubmitButton>
          <Button type="button" variant="secondary" size="sm" onClick={() => go("preview")} disabled={busy || fields.length === 0}><Eye className="h-3.5 w-3.5" /> {dirty ? "Save & Preview" : "Preview"}</Button>
          <Button type="button" size="sm" onClick={() => go("publish")} disabled={busy || fields.length === 0}><Send className="h-3.5 w-3.5" /> {dirty ? "Save & Publish" : "Publish"}</Button>
        </div>
      </div>
      <FormError form={form} />

      <div className="grid gap-4 xl:grid-cols-[240px_1fr_260px]">
        <Card className="self-start">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold text-slate-900">Media Library</div>
          <div className="space-y-2 p-3"><SearchInput placeholder="Search..." maxLength={120} value={q} onChange={(e) => setQ(e.target.value)} /><PillTabs options={(["ALL", "IMG", "VID", "PDF"] as const).map((v) => ({ value: v, label: v }))} value={filter} onChange={setFilter} /></div>
          {full && <p className="px-4 pb-2 text-[11px] text-amber-600">A playlist can hold at most {PLAYLIST_MAX_ITEMS} items.</p>}
          <QueryState query={library} skeleton={<div className="p-3"><TableSkeleton rows={4} /></div>} empty={<div className="px-4 py-8 text-center text-xs text-slate-400">No ready media{search || filter !== "ALL" ? " matches" : " yet — upload some first"}.</div>}>
            {({ data }) => (
              <ul className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
                {data.map((m) => (
                  <li key={m.id} className="flex items-center gap-2 px-3 py-2">
                    <Thumb url={m.thumbnailUrl} type={m.type} className="h-7 w-10 shrink-0" />
                    <span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-medium text-slate-800">{stripExt(m.name)}</span><span className="flex items-center gap-1"><Badge tone={typeTone(m.type)}>{typeShort(m.type)}</Badge>{m.durationSec && <span className="text-[9px] text-slate-400">{fmtClock(m.durationSec)}</span>}</span></span>
                    <button type="button" onClick={() => add(m)} disabled={busy || full} className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40" aria-label={`Add ${m.name}`}><Plus className="h-3 w-3" /></button>
                  </li>
                ))}
              </ul>
            )}
          </QueryState>
        </Card>

        <Card className="self-start">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><span className="text-xs font-semibold text-slate-900">Timeline</span><span className="text-[11px] text-slate-400" title={`Each item shows for 1–${DURATION_MAX} whole seconds`}>{fields.length} item{fields.length !== 1 ? "s" : ""} · {fmtClock(total)}</span></div>
          {listError && <p role="alert" className="px-4 pt-2 text-[11px] font-medium text-red-600">{listError}</p>}
          {fields.length === 0 ? <div className="px-4 py-14 text-center text-xs text-slate-400">Add media from the library to build your timeline.</div> : (
            <ul className="space-y-2 p-3">
              {fields.map((it, i) => {
                const err = fieldError(form, `items.${i}.duration`);
                return (
                  <li key={it.key} onClick={() => setCur(i)} className={cn("rounded-lg border px-2 py-2", err ? "border-red-200 bg-red-50/30" : i === cur ? "border-blue-200 bg-blue-50/30" : "border-slate-200")}>
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded border border-slate-200 text-[10px] font-semibold text-slate-500">{i + 1}</span>
                      <span className="flex flex-col text-slate-300"><button type="button" onClick={(e) => { e.stopPropagation(); move(i, -1); }} disabled={busy || i === 0} className="disabled:opacity-30" aria-label="Move up"><ChevronUp className="h-3 w-3" /></button><button type="button" onClick={(e) => { e.stopPropagation(); move(i, 1); }} disabled={busy || i === fields.length - 1} className="disabled:opacity-30" aria-label="Move down"><ChevronDown className="h-3 w-3" /></button></span>
                      <GripVertical className="hidden h-3.5 w-3.5 text-slate-300 sm:block" />
                      <Thumb url={it.thumbnailUrl} type={it.type} className="h-8 w-12 shrink-0" />
                      <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-900">{stripExt(it.name)}</span><Badge tone={typeTone(it.type)}>{typeShort(it.type)}</Badge></span>
                      <span className="flex items-center gap-1"><input type="text" inputMode="numeric" maxLength={4} disabled={busy} onClick={(e) => e.stopPropagation()} {...maskedRegister(form, `items.${i}.duration`, maskDuration)} aria-invalid={err ? true : undefined} aria-describedby={err ? `dur-err-${it.key}` : undefined} className="h-7 w-14 rounded border border-slate-200 text-center text-xs outline-none focus:border-blue-500 aria-invalid:border-red-400" aria-label={`Duration of item ${i + 1} in seconds`} /><span className="text-[10px] text-slate-400">sec</span></span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); remove(i); setCur((c) => Math.max(0, Math.min(c, fields.length - 2))); }} disabled={busy} className="text-slate-400 hover:text-red-500 disabled:opacity-30" aria-label="Remove"><X className="h-3.5 w-3.5" /></button>
                    </div>
                    {err && <p id={`dur-err-${it.key}`} role="alert" className="mt-1 pl-7 text-[11px] font-medium text-red-600">Duration: {err}</p>}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="self-start">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold text-slate-900">Preview</div>
          <div className="p-3">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-900">{previewRow && <Thumb url={previewRow.thumbnailUrl} type={previewRow.type} className="h-full w-full rounded-none" />}</div>
            <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-slate-500"><button type="button" onClick={() => setCur((c) => Math.max(0, c - 1))} className="flex h-6 w-6 items-center justify-center rounded border border-slate-200" aria-label="Previous"><ChevronLeft className="h-3 w-3" /></button>{items.length ? `${Math.min(cur, items.length - 1) + 1} / ${items.length}` : "0 / 0"}<button type="button" onClick={() => setCur((c) => Math.min(items.length - 1, c + 1))} className="flex h-6 w-6 items-center justify-center rounded border border-slate-200" aria-label="Next"><ChevronRight className="h-3 w-3" /></button></div>
            <dl className="mt-3 space-y-1.5 text-xs"><div className="flex justify-between"><dt className="text-slate-400">Items</dt><dd className="font-semibold text-slate-800">{items.length}</dd></div><div className="flex justify-between"><dt className="text-slate-400">Duration</dt><dd className="font-semibold text-slate-800">{fmtClock(total)}</dd></div><div className="flex justify-between"><dt className="text-slate-400">Status</dt><dd><Badge tone={playlist.status === "PUBLISHED" ? "green" : "slate"} dot>{label(playlist.status)}</Badge></dd></div><div className="flex justify-between"><dt className="text-slate-400">Version</dt><dd className="font-semibold text-slate-800">v{playlist.version}</dd></div></dl>
            <Button type="button" className="mt-3 w-full" size="sm" onClick={() => go("publish")} disabled={busy || fields.length === 0}><Send className="h-3.5 w-3.5" /> {dirty ? "Save & Publish" : "Publish"}</Button>
          </div>
        </Card>
      </div>
    </form>
  );
}

export function PlaylistEditor({ id, companyId, basePath = "/portal/playlists", query = "" }: { id: string; companyId?: string | null; basePath?: string; query?: string }) {
  const playlist = usePlaylist(id, { companyId });
  return <QueryState query={playlist} skeleton={<div className="grid gap-4 xl:grid-cols-[240px_1fr_260px]"><Skeleton className="h-96" /><Skeleton className="h-96" /><Skeleton className="h-96" /></div>}>{(p) => <Editor key={`${p.id}-${p.version}`} playlist={p} companyId={companyId} basePath={basePath} query={query} />}</QueryState>;
}
