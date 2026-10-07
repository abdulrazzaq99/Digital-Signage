"use client";
import { AudienceBadge, AudiencePicker, audienceError, AUDIENCE_API_FIELDS, EVERYONE } from "@/components/targeting/audience";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { applyApiError, Field, fieldError, FormError, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Input, Label, PillTabs, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/misc";
import { Modal, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { CardGridSkeleton, EmptyState, QueryState } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { useBroadcasts, useCreateBroadcast, useDeleteBroadcast, useUpdateBroadcast, useUploadBroadcastFile } from "@/lib/api/hooks/broadcasts";
import { useTemplates } from "@/lib/api/hooks/templates";
import type { Broadcast } from "@/lib/api/types";
import { errorMessage, formatDateTime, fromDateTimeInput, toDateTimeInput } from "@/lib/format";
import { maskInteger, maskName } from "@/lib/validation/masks";
import { Pause, Pencil, Play, Plus, Radio, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { useWatch } from "react-hook-form";
import { missingForPush, pushSchema, toCreateBody, type PushValues } from "./broadcast-schema";

const STATUS: Record<Broadcast["status"], { tone: "green" | "blue" | "slate" | "amber"; label: string }> = {
  LIVE: { tone: "green", label: "On screens now" }, SCHEDULED: { tone: "blue", label: "Scheduled" }, ENDED: { tone: "slate", label: "Ended" }, PAUSED: { tone: "amber", label: "Paused" },
};

const when = (b: Broadcast) => `${formatDateTime(b.startsAt)} → ${b.endsAt ? formatDateTime(b.endsAt) : "until stopped"}`;

/** New push, or editing one: title, seconds, dates and who sees it (the file itself can't change). */
function PushModal({ push, onClose }: { push?: Broadcast; onClose: () => void }) {
  const toast = useToast();
  const create = useCreateBroadcast();
  const update = useUpdateBroadcast();
  const upload = useUploadBroadcastFile();
  const templates = useTemplates();
  const [file, setFile] = useState<{ name: string; fileKey: string; videoSec?: number; width?: number; height?: number } | null>(null);
  const [fileError, setFileError] = useState("");
  const [progress, setProgress] = useState(0);
  const form = useZodForm(pushSchema, {
    defaultValues: { title: push?.title ?? "", source: push?.source === "TEMPLATE" ? "template" : "upload", templateId: push?.templateId ?? "", displaySec: String(push?.displaySec ?? 10), start: push ? toDateTimeInput(push.startsAt) : "", end: toDateTimeInput(push?.endsAt), audience: push?.audience ?? EVERYONE } satisfies PushValues,
  });
  const { register, formState, setValue, control } = form;
  const [source, templateId, audience] = useWatch({ control, name: ["source", "templateId", "audience"] });
  const busy = formState.isSubmitting || upload.isPending;
  const video = push ? push.type === "VIDEO" : !!file?.videoSec;
  const list = templates.data?.data ?? [];
  const chosen = list.find((t) => t.id === templateId);
  const close = () => { if (!busy) onClose(); };

  const pick = (f?: File) => {
    if (!f) return;
    setFileError(""); setFile(null); setProgress(0);
    if (!["image/png", "image/jpeg", "video/mp4"].includes(f.type)) { setFileError("Choose a JPG or PNG picture, or an MP4 video"); return; }
    upload.mutate({ file: f, onProgress: setProgress }, { onSuccess: (r) => setFile({ name: f.name, ...r }), onError: (e) => setFileError(errorMessage(e)) });
  };

  const submit = form.handleSubmit(async (v) => {
    if (!push && v.source === "upload" && !file) { setFileError("Upload a picture or video first"); return; }
    if (!push && v.source === "template" && chosen && missingForPush(chosen).length) return;
    try {
      if (push) {
        await update.mutateAsync({ id: push.id, title: v.title, ...(push.type === "IMAGE" ? { displaySec: Number(v.displaySec) } : {}), audience: v.audience, ...(v.start ? { startsAt: fromDateTimeInput(v.start)! } : {}), endsAt: fromDateTimeInput(v.end) });
        toast.success("Push updated", v.title);
      } else {
        const saved = await create.mutateAsync(toCreateBody(v, file));
        toast.success(saved.status === "LIVE" ? "On screens now" : "Push scheduled", `${saved.title} · ${saved.screens} screen${saved.screens === 1 ? "" : "s"}`);
      }
      onClose();
    } catch (e) { applyApiError(form, e, { ...AUDIENCE_API_FIELDS, startsAt: "start", endsAt: "end", fileKey: "title" }); }
  });

  return (
    <Modal open onClose={close} width="max-w-[560px]">
      <ModalHeader title={push ? "Edit push" : "Push to screens"} subtitle="Plays at the end of each loop of the locations' own content, on every screen they have." onClose={close} />
      <form onSubmit={submit} noValidate>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
          <FormError form={form} />
          <Field label="Title" required error={formState.errors.title?.message}><Input autoFocus maxLength={120} placeholder="e.g. Extra Gum, two for one" {...maskedRegister(form, "title", maskName)} /></Field>
          {!push && (
            <div>
              <Label>What to show</Label>
              <PillTabs options={[{ value: "upload" as const, label: "A picture or video" }, { value: "template" as const, label: "A template" }]} value={source} onChange={(v) => setValue("source", v, { shouldValidate: formState.isSubmitted })} />
              {source === "upload" ? (
                <div className="mt-2 space-y-1.5">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                    <Upload className="h-3.5 w-3.5" /> {upload.isPending ? `Uploading… ${progress}%` : file ? "Choose another file" : "Choose a file"}
                    <input type="file" accept="image/png,image/jpeg,video/mp4" className="sr-only" disabled={upload.isPending} onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
                  </label>
                  {file && <p className="text-xs text-slate-600">{file.name}{file.videoSec ? ` · video, ${file.videoSec} s` : " · picture"}</p>}
                  {fileError ? <p role="alert" className="text-[11px] font-medium text-red-600">{fileError}</p> : <p className="text-[11px] text-slate-400">JPG, PNG or MP4, up to 500 MB.</p>}
                </div>
              ) : (
                <Field className="mt-2" error={fieldError(form, "templateId") ?? (chosen && missingForPush(chosen).length ? `Give these fields a Head Office value first: ${missingForPush(chosen).join(", ")}` : undefined)} hint="Uses Head Office's values. To let each location add its own price, share the template with them instead.">
                  <Select {...register("templateId")} disabled={templates.isPending}>
                    <option value="">{templates.isPending ? "Loading templates…" : "Choose a template"}</option>
                    {list.map((t) => <option key={t.id} value={t.id}>{t.name}{missingForPush(t).length ? " (needs values)" : ""}</option>)}
                  </Select>
                </Field>
              )}
            </div>
          )}
          {!video && <Field label="Seconds on screen" required hint="Each time it comes round, 3–600 seconds." error={formState.errors.displaySec?.message}><Input className="w-28" inputMode="numeric" {...maskedRegister(form, "displaySec", (v) => maskInteger(v, 3))} /></Field>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start" hint="Blank means now." error={formState.errors.start?.message}><Input type="datetime-local" {...register("start")} /></Field>
            <Field label="End" hint="Blank means until you stop it." error={formState.errors.end?.message}><Input type="datetime-local" {...register("end")} /></Field>
          </div>
          <div><Label>Which locations</Label><AudiencePicker value={audience} onChange={(a) => setValue("audience", a, { shouldDirty: true, shouldValidate: formState.isSubmitted })} error={audienceError(formState.errors.audience)} /></div>
        </div>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={close} disabled={busy}>Cancel</Button>
          <SubmitButton form={form} disabled={busy} pendingText="Saving…">{push ? "Save" : "Push to screens"}</SubmitButton>
        </ModalFooter>
      </form>
    </Modal>
  );
}

function DeleteModal({ push, onClose }: { push: Broadcast; onClose: () => void }) {
  const remove = useDeleteBroadcast();
  const toast = useToast();
  const [error, setError] = useState("");
  return (
    <Modal open onClose={() => !remove.isPending && onClose()} width="max-w-[420px]">
      <ModalHeader title={`Delete "${push.title}"?`} subtitle={push.status === "LIVE" ? `It comes off ${push.screens} screen${push.screens === 1 ? "" : "s"} straight away.` : "It won't be shown again."} onClose={onClose} />
      {error && <p role="alert" className="px-6 text-xs text-red-600">{error}</p>}
      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={remove.isPending}>Cancel</Button>
        <Button variant="danger" disabled={remove.isPending} onClick={() => remove.mutate(push.id, { onSuccess: () => { toast.success("Push deleted", push.title); onClose(); }, onError: (e) => setError(errorMessage(e)) })}>{remove.isPending ? "Deleting…" : "Delete"}</Button>
      </ModalFooter>
    </Modal>
  );
}

export function BroadcastsPage() {
  const pushes = useBroadcasts();
  const update = useUpdateBroadcast();
  const toast = useToast();
  const [editing, setEditing] = useState<Broadcast | "new" | null>(null);
  const [deleting, setDeleting] = useState<Broadcast | null>(null);
  const toggle = (b: Broadcast) => update.mutate({ id: b.id, active: !b.active }, { onSuccess: (r) => toast.success(r.active ? "Resumed" : "Paused", r.title), onError: (e) => toast.error(e) });
  return (
    <div className="space-y-5">
      <PageHeader title="Push to Screens" subtitle="Send a picture, video or template straight to locations' screens. It plays after their own content." action={<Button onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> New push</Button>} />
      <QueryState query={pushes} skeleton={<CardGridSkeleton count={6} className="xl:grid-cols-3" />} empty={<EmptyState icon={<Radio className="h-5 w-5" />} title="Nothing pushed yet" body="Push Head Office content to all Kiosks, all Restaurants, both, or chosen locations." action={<Button onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> New push</Button>} />}>
        {(data) => (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.map((b) => (
              <div key={b.id} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-video bg-slate-900">
                  {b.type === "VIDEO" ? <video src={b.previewUrl} muted playsInline preload="metadata" className="h-full w-full object-contain" /> : <img src={b.previewUrl} alt="" className="h-full w-full object-contain" />}
                  <Badge tone={STATUS[b.status].tone} dot className="absolute left-2 top-2">{STATUS[b.status].label}</Badge>
                </div>
                <div className="flex flex-1 flex-col gap-2 px-4 py-3">
                  <div className="truncate text-sm font-semibold text-slate-900">{b.title}</div>
                  <div className="flex flex-wrap items-center gap-1.5"><AudienceBadge audience={b.audience} /><span className="text-[11px] text-slate-500">{b.screens} screen{b.screens === 1 ? "" : "s"} · {b.type === "VIDEO" ? `video, ${b.displaySec} s` : `${b.displaySec} s each time`}{b.source === "TEMPLATE" ? " · template" : ""}</span></div>
                  <div className="text-[11px] text-slate-400">{when(b)}</div>
                  <div className="mt-auto flex flex-wrap gap-2 pt-1">
                    {b.status !== "ENDED" && <Button size="sm" variant="secondary" onClick={() => toggle(b)} disabled={update.isPending}>{b.active ? <><Pause className="h-3.5 w-3.5" /> Pause</> : <><Play className="h-3.5 w-3.5" /> Resume</>}</Button>}
                    <Button size="sm" variant="secondary" onClick={() => setEditing(b)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                    <Button size="sm" variant="danger-outline" onClick={() => setDeleting(b)}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </QueryState>
      {editing && <PushModal push={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
      {deleting && <DeleteModal push={deleting} onClose={() => setDeleting(null)} />}
    </div>
  );
}
