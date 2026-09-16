"use client";
import { MediaPreview, typeTone } from "@/components/portal/media-drawer";
import { PortalUploadModal } from "@/components/portal/upload-media-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Select } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { Alert } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useCompanyNames } from "@/lib/api/hooks/companies";
import { mediaTypeLabel, useDeleteMedia } from "@/lib/api/hooks/media";
import type { Media } from "@/lib/api/types";
import { errorMessage, fmtClock } from "@/lib/format";
import { Eye, Upload, X } from "lucide-react";
import { useState } from "react";

/** Super Admin upload: pick the company first, then the shared upload flow uploads on its behalf. */
export function UploadMediaModal({ open, onClose, defaultCompanyId }: { open: boolean; onClose: () => void; defaultCompanyId?: string }) {
  const { companies } = useCompanyNames();
  const [companyId, setCompanyId] = useState(defaultCompanyId ?? "");
  const effective = companyId || defaultCompanyId || companies[0]?.id || "";
  return (
    <PortalUploadModal
      open={open}
      onClose={onClose}
      companyId={effective}
      extra={
        <div>
          <Label required>Upload to company</Label>
          <Select value={effective} onChange={(e) => setCompanyId(e.target.value)}>{companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
          <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400"><Upload className="h-3 w-3" /> Files become part of this company&apos;s media library.</p>
        </div>
      }
    />
  );
}

/** Generic rename dialog; `onSave` performs the mutation and may throw to keep the dialog open. */
export function RenameModal({ open, onClose, name, kind = "Media", onSave }: { open: boolean; onClose: () => void; name: string; kind?: string; onSave: (name: string) => Promise<unknown> }) {
  const [value, setValue] = useState(name);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async () => {
    setPending(true);
    setError("");
    try { await onSave(value.trim()); onClose(); } catch (e) { setError(errorMessage(e)); } finally { setPending(false); }
  };
  return (
    <Modal open={open} onClose={onClose} width="max-w-[400px]">
      <ModalHeader title={`Rename ${kind}`} onClose={onClose} />
      <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <div className="px-6 py-5"><Label>{kind} Name</Label><Input value={value} onChange={(e) => setValue(e.target.value)} autoFocus required minLength={1} />{error && <p className="mt-1.5 text-[11px] text-red-600">{error}</p>}</div>
        <div className="flex justify-end gap-2 px-6 pb-6"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" disabled={pending || !value.trim() || value.trim() === name}>{pending ? "Saving…" : "Save Changes"}</Button></div>
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
  const inUse = (item?.usedIn.length ?? 0) > 0;
  const doDelete = () => item && remove.mutate({ id: item.id, force: inUse }, { onSuccess: () => { toast.success(failed ? "Upload removed" : "Media deleted", item.name); onClose(); onDeleted?.(); }, onError: (e) => setError(errorMessage(e)) });
  return (
    <Modal open={!!item} onClose={onClose} width="max-w-[400px]">
      {item && (
        <>
          <ModalHeader title={failed ? "Remove Failed Upload?" : "Delete Media?"} onClose={onClose} />
          <div className="space-y-3 px-6 pt-4">
            <p className="text-xs leading-5 text-slate-500">{failed ? "Remove" : "Permanently delete"} <span className="font-semibold text-slate-800">&quot;{item.name}&quot;</span> from the media library?</p>
            {inUse && <Alert tone="amber">Used by {item.usedIn.length} playlist{item.usedIn.length > 1 ? "s" : ""} ({item.usedIn.map((u) => u.name).join(", ")}). Deleting removes it from them.</Alert>}
            {error && <Alert tone="red">{error}</Alert>}
          </div>
          <div className="flex justify-end gap-2 px-6 py-5"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="danger" onClick={doDelete} disabled={remove.isPending}>{remove.isPending ? "Deleting…" : failed ? "Remove" : "Delete"}</Button></div>
        </>
      )}
    </Modal>
  );
}
