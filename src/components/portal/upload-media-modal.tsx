"use client";
import { Button } from "@/components/ui/button";
import { MAX_BATCH_FILES, planAdd, uploadTagsSchema } from "@/components/media/upload-checks";
import { applyApiError, Field, fieldError, FormError, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useUpload } from "@/lib/api/hooks/media";
import { ApiError } from "@/lib/api/client";
import { errorMessage, formatBytes } from "@/lib/format";
import { parseTags } from "@/lib/validation/fields";
import { maskTags } from "@/lib/validation/masks";
import { ACCEPT, ALLOWED_MIME } from "@/lib/upload";
import { Check, FileText, Film, ImageIcon, Upload, X } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";

/** `invalid` rows failed the add-time checks (type, size, name) and are never sent. */
type Row = { file: File; status: "queued" | "invalid" | "uploading" | "done" | "error"; error?: string };

function FileIcon({ type }: { type: string }) {
  const I = ALLOWED_MIME[type] === "VIDEO" ? Film : ALLOWED_MIME[type] === "PDF" ? FileText : ImageIcon;
  return <I className="h-4 w-4" />;
}

/**
 * Multi-file upload. Files go straight to object storage; the API only sees metadata.
 * `companyId` is set by the Super Admin to upload on a customer's behalf.
 */
export function PortalUploadModal({ open, onClose, companyId, extra }: { open: boolean; onClose: () => void; companyId?: string | null; extra?: ReactNode }) {
  const toast = useToast();
  const { upload, progress } = useUpload(companyId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [note, setNote] = useState("");
  const [dragging, setDragging] = useState(false);
  const form = useZodForm(uploadTagsSchema, { defaultValues: { tags: "" } });
  const busy = form.formState.isSubmitting;
  const close = () => { if (busy) return; onClose(); setTimeout(() => { setRows([]); setNote(""); form.reset({ tags: "" }); }, 200); };

  /** Checks type, size and name as files arrive, skips duplicates and caps the batch. */
  const addFiles = (files: FileList | File[]) => {
    if (busy) return;
    const { add, skipped } = planAdd(rows.map((r) => r.file), Array.from(files));
    setRows((r) => [...r, ...add.map(({ file, problem }): Row => (problem ? { file, status: "invalid", error: problem } : { file, status: "queued" }))]);
    setNote(skipped ?? "");
  };
  const setRow = (i: number, patch: Partial<Row>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const sendable = rows.filter((r) => r.status === "queued" || r.status === "error").length;

  const start = form.handleSubmit(async (v) => {
    if (!sendable) { form.setError("root.server", { type: "manual", message: rows.length ? "None of these files can be uploaded. Remove them and add JPG, PNG, MP4 or PDF files." : "Add at least one file to upload." }); return; }
    const tagList = parseTags(v.tags);
    let ok = 0;
    let failed = 0;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].status !== "queued" && rows[i].status !== "error") continue;
      setRow(i, { status: "uploading", error: undefined });
      try { await upload(rows[i].file, tagList); setRow(i, { status: "done" }); ok++; }
      catch (e) {
        failed++;
        // Tag problems reported by the API belong on the tags field, not on every file.
        if (e instanceof ApiError && Array.isArray(e.details) && (e.details as { path?: string }[]).some((d) => d.path?.startsWith("body.tags"))) { applyApiError(form, e); setRow(i, { status: "error", error: "Not uploaded: fix the tags and try again." }); break; }
        setRow(i, { status: "error", error: errorMessage(e) });
      }
    }
    if (ok) toast.success(`${ok} file${ok === 1 ? "" : "s"} uploaded`, "Videos and PDFs show as Processing until conversion finishes.");
    if (ok && !failed && rows.every((r) => r.status !== "invalid")) setTimeout(() => { onClose(); setTimeout(() => { setRows([]); setNote(""); form.reset({ tags: "" }); }, 200); }, 600);
  });

  const allDone = rows.length > 0 && rows.every((r) => r.status === "done");

  return (
    <Modal open={open} onClose={close} width="max-w-[520px]">
      <ModalHeader title="Upload Media" subtitle={`JPG, PNG, MP4, PDF · up to 500 MB each · ${MAX_BATCH_FILES} files at a time`} onClose={close} />
      <form onSubmit={start} noValidate className="space-y-4 px-6 pb-6 pt-4">
        {extra}
        <input ref={inputRef} type="file" accept={ACCEPT} multiple className="hidden" onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          className={`flex w-full flex-col items-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors disabled:opacity-60 ${dragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50/60 hover:border-blue-300"}`}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Upload className="h-4 w-4" /></span>
          <span className="mt-3 text-sm font-semibold text-slate-900">Drag &amp; drop files here</span>
          <span className="mt-0.5 text-[11px] text-slate-400">or click to browse your files</span>
          <span className="mt-3 flex gap-1">{["JPG", "PNG", "MP4", "PDF", "Max 500 MB"].map((t) => <span key={t} className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-slate-500">{t}</span>)}</span>
        </button>
        {note && <p role="status" className="text-[11px] text-amber-600">{note}</p>}
        <FormError form={form} />

        {rows.length > 0 && (
          <ul className="space-y-2 animate-fade-in">
            {rows.map((r, i) => (
              <li key={r.file.name + r.file.size} className={`rounded-lg border px-3 py-2.5 ${r.status === "invalid" ? "border-red-200 bg-red-50/40" : "border-slate-200"}`}>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500"><FileIcon type={r.file.type} /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-900">{r.file.name}</span><span className="block text-[10px] text-slate-400">{formatBytes(r.file.size)} · {ALLOWED_MIME[r.file.type] ?? "Unsupported"}</span></span>
                  {r.status === "done" ? <Check className="h-4 w-4 text-green-600" /> : (r.status === "queued" || r.status === "invalid" || r.status === "error") && !busy ? <button type="button" onClick={() => setRows((x) => x.filter((_, j) => j !== i))} className="text-slate-400 hover:text-slate-600" aria-label={`Remove ${r.file.name}`}><X className="h-3.5 w-3.5" /></button> : null}
                </div>
                {r.status === "uploading" && <div className="mt-2"><div className="flex justify-between text-[10px]"><span className="font-semibold text-slate-700">{(progress[r.file.name] ?? 0) < 100 ? "Uploading…" : "Finalising…"}</span><span className="text-slate-400">{progress[r.file.name] ?? 0}%</span></div><div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-[width]" style={{ width: `${progress[r.file.name] ?? 0}%` }} /></div></div>}
                {(r.status === "error" || r.status === "invalid") && <div role="alert" className="mt-1.5 text-[11px] text-red-600">{r.error}</div>}
              </li>
            ))}
          </ul>
        )}

        {rows.length > 0 && !allDone && (
          <Field label={<>Tags <span className="font-normal text-slate-400">(optional, comma-separated)</span></>} hint="Up to 20 tags of 40 characters, applied to every file in this batch." error={fieldError(form, "tags")}>
            <Input placeholder="lobby, summer" disabled={busy} {...maskedRegister(form, "tags", maskTags)} />
          </Field>
        )}

        <div className="flex gap-2">
          {allDone ? <Button type="button" size="sm" onClick={close}>Done</Button> : <SubmitButton form={form} size="sm" pendingText="Uploading…" disabled={rows.length > 0 && sendable === 0}><Upload className="h-3.5 w-3.5" /> {`Upload ${sendable || ""} file${sendable === 1 ? "" : "s"}`}</SubmitButton>}
          <Button type="button" size="sm" variant="secondary" onClick={close} disabled={busy}>{allDone ? "Close" : "Cancel"}</Button>
        </div>
      </form>
    </Modal>
  );
}
