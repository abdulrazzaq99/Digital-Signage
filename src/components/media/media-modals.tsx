"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import type { MediaItem } from "@/lib/data";
import { img } from "@/lib/utils";
import { Check, Eye, FileText, ImageIcon, Play, Upload, Video, X } from "lucide-react";
import { useEffect, useState } from "react";

export function UploadMediaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [stage, setStage] = useState<"empty" | "selected" | "done">("empty");
  const close = () => { onClose(); setTimeout(() => setStage("empty"), 200); };
  useEffect(() => { if (!open) return; }, [open]);
  return (
    <Modal open={open} onClose={close} width="max-w-[600px]">
      <ModalHeader title="Upload Media" subtitle="Add images, videos or PDFs to your media library." onClose={close} />
      <div className="space-y-4 px-6 py-5">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-500"><Upload className="h-3 w-3" /> Uploading to: <span className="font-semibold text-slate-800">Acme Retail</span></span>
        <button type="button" onClick={() => stage === "empty" && setStage("selected")} className="flex w-full flex-col items-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center transition-colors hover:border-blue-300">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm"><Upload className="h-4 w-4" /></span>
          <span className="mt-3 text-sm font-semibold text-slate-900">Drag &amp; drop files here</span>
          <span className="mt-0.5 text-[11px] text-slate-400">or choose files from your computer</span>
          <span className="mt-3 inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700">Browse Files</span>
          <span className="mt-2 text-[10px] text-slate-300">JPG · PNG · MP4 · PDF</span>
          {stage === "done" && <span className="mt-2 text-[10px] font-medium text-blue-600">Load demo files</span>}
        </button>
        {stage !== "empty" && (
          <div className="rounded-lg border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 text-xs"><span className="font-semibold text-slate-800">1 file selected</span>{stage === "done" && <span className="text-slate-400">1 ready</span>}</div>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><ImageIcon className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">Summer Campaign <Badge tone="blue">JPG</Badge><span className="text-[11px] font-normal text-slate-400">2.4 MB</span></div>
                {stage === "done" ? <div className="mt-1.5 flex items-center gap-2"><div className="h-1 flex-1 rounded-full bg-green-500" /><span className="text-[10px] font-semibold text-slate-600">100%</span><span className="flex items-center gap-1 text-[10px] font-medium text-green-600"><Check className="h-3 w-3" /> Uploaded</span></div> : <div className="mt-1 text-[10px] text-slate-400">Waiting</div>}
              </div>
              <button className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50"><X className="h-3 w-3" /></button>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
        <span className="text-xs font-medium text-green-600">{stage === "done" && <><Check className="mr-1 inline h-3.5 w-3.5" />1 file uploaded successfully</>}</span>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={close}>Cancel</Button>
          {stage === "selected" ? <Button onClick={() => setStage("done")}><Upload className="h-3.5 w-3.5" /> Upload 1 File</Button> : <Button onClick={close}>Done</Button>}
        </div>
      </div>
    </Modal>
  );
}

export function RenameModal({ open, onClose, name, kind = "Media" }: { open: boolean; onClose: () => void; name: string; kind?: string }) {
  return (
    <Modal open={open} onClose={onClose} width="max-w-[400px]">
      <ModalHeader title={`Rename ${kind}`} onClose={onClose} />
      <form onSubmit={(e) => { e.preventDefault(); onClose(); }}>
        <div className="px-6 py-5"><Label>{kind} Name</Label><Input defaultValue={name} autoFocus /></div>
        <div className="flex justify-end gap-2 px-6 pb-6"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit">Save Changes</Button></div>
      </form>
    </Modal>
  );
}

export function PreviewMediaModal({ item, onClose }: { item: MediaItem | null; onClose: () => void }) {
  return (
    <Modal open={!!item} onClose={onClose} width="max-w-[760px]">
      {item && (
        <>
          <div className="flex items-center justify-between px-5 pt-4">
            <div className="flex items-center gap-2"><Badge tone="blue">{item.type.toUpperCase()}</Badge><span className="text-sm font-semibold text-slate-900">{item.name}</span></div>
            <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50"><X className="h-3.5 w-3.5" /></button>
          </div>
          <div className="px-5 pt-4">
            <div className="relative overflow-hidden rounded-lg bg-slate-900">
              {item.type === "PDF" ? <div className="flex aspect-video items-center justify-center text-slate-400"><FileText className="h-12 w-12" /></div> : <img src={img(item.seed, 1200, 675)} alt="" className="aspect-video w-full object-cover" />}
              {item.type === "Video" && <><span className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white"><Play className="h-5 w-5 fill-current" /></span><div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-3 py-2 text-[10px] text-white"><span className="flex items-center gap-2"><Play className="h-3 w-3 fill-current" /> 00:00 / {item.duration}</span><Video className="h-3 w-3" /></div></>}
            </div>
          </div>
          <div className="flex justify-end gap-2 px-5 py-4"><Button variant="secondary" onClick={onClose}>Close</Button><Button href={`/media/${item.id}`} onClick={onClose}><Eye className="h-3.5 w-3.5" /> View Details</Button></div>
        </>
      )}
    </Modal>
  );
}

export function RemoveMediaModal({ item, onClose, failed }: { item: MediaItem | null; onClose: () => void; failed?: boolean }) {
  return (
    <Modal open={!!item} onClose={onClose} width="max-w-[380px]">
      {item && (
        <>
          <ModalHeader title={failed ? "Remove Failed Upload?" : "Delete Media?"} onClose={onClose} />
          <p className="px-6 pt-4 text-xs leading-5 text-slate-500">{failed ? "Remove" : "Permanently delete"} <span className="font-semibold text-slate-800">&quot;{item.name}&quot;</span> from your media library?{!failed && " Playlists using this file will be affected."}</p>
          <div className="flex justify-end gap-2 px-6 py-5"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="danger" onClick={onClose}>{failed ? "Remove" : "Delete"}</Button></div>
        </>
      )}
    </Modal>
  );
}
