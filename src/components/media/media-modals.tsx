"use client";
import { MediaPreview, typeTone } from "@/components/portal/media-drawer";
import { PortalUploadModal } from "@/components/portal/upload-media-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanySelect, useCompanyOptions } from "@/components/screens/query-guards";
import { applyApiError, Field, fieldError, FormError, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Input, Label } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { Alert } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { mediaTypeLabel, useDeleteMedia } from "@/lib/api/hooks/media";
import type { Media } from "@/lib/api/types";
import { errorMessage, fmtClock } from "@/lib/format";
import { Eye, Upload, X } from "lucide-react";
import { useState } from "react";
import { text } from "@/lib/validation/fields";
import { maskName } from "@/lib/validation/masks";
import { z } from "zod";

/** Super Admin upload: pick the company first, then the shared upload flow uploads on its behalf. */
export function UploadMediaModal({ open, onClose, defaultCompanyId }: { open: boolean; onClose: () => void; defaultCompanyId?: string }) {
  const companies = useCompanyOptions();
  const [companyId, setCompanyId] = useState(defaultCompanyId ?? "");
  const effective = companyId || defaultCompanyId || companies.data?.data[0]?.id || "";
  return (
    <PortalUploadModal
      open={open}
      onClose={onClose}
      companyId={effective}
      extra={
        <div>
          <Label htmlFor="upload-company" required>Upload to company</Label>
          <CompanySelect id="upload-company" value={effective} onChange={setCompanyId} />
          <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400"><Upload className="h-3 w-3" /> Files become part of this company&apos;s media library.</p>
        </div>
      }
    />
  );
}

export const MEDIA_NAME_MAX = 120;
const renameSchema = z.object({ name: text(MEDIA_NAME_MAX) });

/** Rename dialog; `onSave` performs the mutation and may throw to keep the dialog open with the error. */
export function RenameModal({ open, onClose, name, kind = "Media", onSave }: { open: boolean; onClose: () => void; name: string; kind?: string; onSave: (name: string) => Promise<unknown> }) {
  const form = useZodForm(renameSchema, { defaultValues: { name } });
  const close = () => { if (!form.formState.isSubmitting) onClose(); };
  const submit = form.handleSubmit(async (v) => {
    if (v.name === name) { onClose(); return; }
    try { await onSave(v.name); onClose(); } catch (e) { applyApiError(form, e); }
  });
  return (
    <Modal open={open} onClose={close} width="max-w-[400px]">
      <ModalHeader title={`Rename ${kind}`} onClose={close} />
      <form onSubmit={submit} noValidate>
        <div className="space-y-3 px-6 py-5">
          <FormError form={form} />
          <Field label={`${kind} Name`} required hint={`Up to ${MEDIA_NAME_MAX} characters`} error={fieldError(form, "name")}><Input maxLength={MEDIA_NAME_MAX} autoFocus {...maskedRegister(form, "name", maskName)} /></Field>
        </div>
        <div className="flex justify-end gap-2 px-6 pb-6"><Button type="button" variant="secondary" onClick={close} disabled={form.formState.isSubmitting}>Cancel</Button><SubmitButton form={form}>Save Changes</SubmitButton></div>
      </form>
    </Modal>
  );
}

export function PreviewMediaModal({ item, onClose }: { item: Media | null; onClose: () => void }) {
  return (
    <Modal open={!!item} onClose={onClose} width="max-w-[760px]">
      {item && (
        <>
          <div className="flex items-center justify-between px-5 pt-4">
            <div className="flex items-center gap-2"><Badge tone={typeTone(item.type)}>{mediaTypeLabel(item.type)}</Badge><span className="text-sm font-semibold text-slate-900">{item.name}</span></div>
            <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50" aria-label="Close"><X className="h-3.5 w-3.5" /></button>
          </div>
          <div className="px-5 pt-4">
            <MediaPreview item={item} className="aspect-video overflow-hidden rounded-lg" />
            {item.type === "VIDEO" && item.durationSec && <div className="mt-1 text-right text-[10px] text-slate-400">Duration {fmtClock(item.durationSec)}</div>}
          </div>
          <div className="flex justify-end gap-2 px-5 py-4"><Button variant="secondary" onClick={onClose}>Close</Button><Button href={`/media/${item.id}`}><Eye className="h-3.5 w-3.5" /> View Details</Button></div>
        </>
      )}
    </Modal>
  );
}

export function RemoveMediaModal({ item, companyId, onClose, onDeleted }: { item: Media | null; companyId?: string | null; onClose: () => void; onDeleted?: () => void }) {
  const toast = useToast();
  const remove = useDeleteMedia(companyId);
  const [error, setError] = useState("");
  const failed = item?.status === "FAILED";
  const usedIn = item?.usedIn ?? [];
  const inUse = usedIn.length > 0;
  // mutateAsync so onDeleted (navigation) still runs if the detail page unmounts when its refetch 404s.
  const doDelete = async () => {
    if (!item || remove.isPending) return;
    try { await remove.mutateAsync({ id: item.id, force: inUse }); toast.success(failed ? "Upload removed" : "Media deleted", item.name); onClose(); onDeleted?.(); } catch (e) { setError(errorMessage(e)); }
  };
  return (
    <Modal open={!!item} onClose={() => !remove.isPending && onClose()} width="max-w-[400px]">
      {item && (
        <>
          <ModalHeader title={failed ? "Remove Failed Upload?" : "Delete Media?"} onClose={onClose} />
          <div className="space-y-3 px-6 pt-4">
            <p className="text-xs leading-5 text-slate-500">{failed ? "Remove" : "Permanently delete"} <span className="font-semibold text-slate-800">&quot;{item.name}&quot;</span> from the media library?</p>
            {inUse && <Alert tone="amber">Used by {usedIn.length} playlist{usedIn.length > 1 ? "s" : ""} ({usedIn.map((u) => u.name).join(", ")}). Deleting removes it from them.</Alert>}
            {error && <Alert tone="red">{error}</Alert>}
          </div>
          <div className="flex justify-end gap-2 px-6 py-5"><Button variant="secondary" onClick={onClose} disabled={remove.isPending}>Cancel</Button><Button variant="danger" onClick={doDelete} disabled={remove.isPending}>{remove.isPending ? "Deleting…" : failed ? "Remove" : "Delete"}</Button></div>
        </>
      )}
    </Modal>
  );
}
