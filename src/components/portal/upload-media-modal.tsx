"use client";
import { Button } from "@/components/ui/button";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { Check, ImageIcon, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";

type Stage = "idle" | "selected" | "uploading" | "complete";

export function PortalUploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [stage, setStage] = useState<Stage>("idle");
  const [pct, setPct] = useState(0);
  const close = () => { onClose(); setTimeout(() => { setStage("idle"); setPct(0); }, 200); };

  useEffect(() => {
    if (stage !== "uploading") return;
    const t = setInterval(() => setPct((p) => {
      if (p >= 100) { clearInterval(t); setTimeout(() => setStage("complete"), 300); return 100; }
      return p + 8;
    }), 120);
    return () => clearInterval(t);
  }, [stage]);
  useEffect(() => {
    if (stage !== "complete") return;
    const t = setTimeout(close, 1400);
    return () => clearTimeout(t);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal open={open} onClose={close} width="max-w-[480px]">
      <ModalHeader title="Upload Media" subtitle="JPG, PNG, MP4, PDF supported" onClose={close} />
      <div className="px-6 pb-6 pt-4">
        {stage === "idle" && (
          <button type="button" onClick={() => setStage("selected")} className="flex w-full flex-col items-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center transition-colors hover:border-blue-300">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Upload className="h-4 w-4" /></span>
            <span className="mt-3 text-sm font-semibold text-slate-900">Drag &amp; drop a file here</span>
            <span className="mt-0.5 text-[11px] text-slate-400">or click to browse your files</span>
            <span className="mt-3 flex gap-1">{["JPG", "PNG", "MP4", "PDF", "Max 500 MB"].map((t) => <span key={t} className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-slate-500">{t}</span>)}</span>
          </button>
        )}
        {stage !== "idle" && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-500"><ImageIcon className="h-4 w-4" /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-900">9c53bbfd-0bb5-447f-a0e0-592060f47d44.jpg</span><span className="block text-[10px] text-slate-400">0.2 MB · IMAGE</span></span>
              {stage === "selected" && <button onClick={() => setStage("idle")} className="text-slate-400 hover:text-slate-600"><X className="h-3.5 w-3.5" /></button>}
            </div>
            {stage === "selected" && <div className="flex gap-2"><Button size="sm" onClick={() => setStage("uploading")}><Upload className="h-3.5 w-3.5" /> Upload File</Button><Button size="sm" variant="secondary" onClick={() => setStage("idle")}>Change File</Button></div>}
            {stage === "uploading" && <div><div className="flex justify-between text-[11px]"><span className="font-semibold text-slate-700">Processing...</span><span className="text-slate-400">Optimising...</span></div><div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-[width]" style={{ width: `${pct}%` }} /></div></div>}
            {stage === "complete" && <div><div className="text-[11px] font-semibold text-slate-700">Complete</div><div className="mt-1.5 h-1 w-full rounded-full bg-green-500" /><div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-green-600"><Check className="h-3.5 w-3.5" /> Upload complete. Adding to your library...</div></div>}
          </div>
        )}
      </div>
    </Modal>
  );
}
