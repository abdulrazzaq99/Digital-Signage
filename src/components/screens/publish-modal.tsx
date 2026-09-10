"use client";
import { Button } from "@/components/ui/button";
import { DotStatus } from "@/components/ui/badge";
import { Checkbox, PillTabs } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { SectionLabel } from "@/components/ui/card";
import { Alert, Stepper, SuccessIcon } from "@/components/ui/misc";
import { contentLibrary, screenGroups, screens } from "@/lib/data";
import { cn, img } from "@/lib/utils";
import { Check, Info, Loader2, Monitor, Send } from "lucide-react";
import { useEffect, useState } from "react";

type TargetMode = "single" | "multiple" | "group";
type Phase = "target" | "content" | "review" | "publishing" | "done";

export function PublishModal({ open, onClose, defaultScreen }: { open: boolean; onClose: () => void; defaultScreen?: string }) {
  const [phase, setPhase] = useState<Phase>("target");
  const [mode, setMode] = useState<TargetMode>("single");
  const [single, setSingle] = useState(defaultScreen ?? screens[0].id);
  const [multi, setMulti] = useState<string[]>([]);
  const [group, setGroup] = useState(screenGroups[2].id);
  const [contentFilter, setContentFilter] = useState<"All" | "Playlists" | "Media">("All");
  const [content, setContent] = useState(contentLibrary[0].id);
  const [progress, setProgress] = useState(0);

  const close = () => { onClose(); setTimeout(() => { setPhase("target"); setProgress(0); }, 200); };

  useEffect(() => {
    if (phase !== "publishing") return;
    const t = setInterval(() => setProgress((p) => {
      if (p >= 3) { clearInterval(t); setTimeout(() => setPhase("done"), 500); return p; }
      return p + 1;
    }), 900);
    return () => clearInterval(t);
  }, [phase]);

  const stepIndex = phase === "target" ? 1 : phase === "content" ? 2 : 3;
  const targetLabel = mode === "single" ? screens.find((s) => s.id === single)?.name : mode === "multiple" ? `${multi.length} screens` : `${screenGroups.find((g) => g.id === group)?.name} (group)`;
  const targetSub = mode === "single" ? "1 screen will receive this content" : mode === "multiple" ? `${multi.length} screens will receive this content` : `${screenGroups.find((g) => g.id === group)?.screens} screen will receive this content`;
  const chosen = contentLibrary.find((c) => c.id === content)!;
  const contentRows = contentLibrary.filter((c) => contentFilter === "All" || (contentFilter === "Playlists" ? c.type === "Playlist" : c.type === "Media"));

  return (
    <Modal open={open} onClose={close} width="max-w-[580px]">
      <ModalHeader title="Publish Content" onClose={close} />
      <div className="px-6 pt-4">
        <Stepper steps={["Select Target", "Select Content", "Review & Publish"]} current={stepIndex} compact />
      </div>

      {phase === "target" && (
        <div className="animate-fade-in">
          <div className="px-6 pt-5">
            <div className="grid grid-cols-3 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-medium">
              {([["single", "Single Screen"], ["multiple", "Multiple Screens"], ["group", "Screen Group"]] as [TargetMode, string][]).map(([v, l]) => (
                <button key={v} onClick={() => setMode(v)} className={cn("h-8 rounded-md transition-colors", mode === v ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800")}>{l}</button>
              ))}
            </div>
          </div>
          <div className="max-h-[280px] space-y-2 overflow-y-auto px-6 py-4">
            {mode === "group" ? screenGroups.map((g) => (
              <button key={g.id} onClick={() => setGroup(g.id)} className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors", group === g.id ? "border-blue-300 bg-blue-50/50" : "border-slate-200 hover:bg-slate-50")}>
                <img src={img(g.seed, 96, 64)} alt="" className="h-8 w-12 rounded object-cover" />
                <span className="flex-1"><span className="block text-sm font-semibold text-slate-900">{g.name}</span><span className="block text-[11px] text-slate-400">{g.company} · {g.screens} screen{g.screens > 1 ? "s" : ""}</span></span>
              </button>
            )) : screens.slice(0, 6).map((s) => {
              const selected = mode === "single" ? single === s.id : multi.includes(s.id);
              const toggle = () => mode === "single" ? setSingle(s.id) : setMulti((m) => m.includes(s.id) ? m.filter((x) => x !== s.id) : [...m, s.id]);
              return (
                <button key={s.id} onClick={toggle} className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors", selected ? "border-blue-300 bg-blue-50/50" : "border-slate-200 hover:bg-slate-50")}>
                  {mode === "multiple" && <Checkbox checked={selected} />}
                  <img src={img(s.seed, 96, 64)} alt="" className="h-8 w-12 rounded object-cover" />
                  <span className="flex-1"><span className="block text-sm font-semibold text-slate-900">{s.name}</span><span className="block text-[11px] text-slate-400">{s.company}{mode === "single" ? ` · ${s.location}` : ""}</span></span>
                  {mode === "single" && <DotStatus status={s.status} className="lowercase" />}
                </button>
              );
            })}
          </div>
          <div className="flex justify-end px-6 pb-6"><Button onClick={() => setPhase("content")} disabled={mode === "multiple" && multi.length === 0}>Continue ›</Button></div>
        </div>
      )}

      {phase === "content" && (
        <div className="animate-fade-in">
          <div className="px-6 pt-5"><PillTabs options={[{ value: "All", label: "All" }, { value: "Playlists", label: "Playlists" }, { value: "Media", label: "Media" }]} value={contentFilter} onChange={setContentFilter} /></div>
          <div className="grid max-h-[300px] grid-cols-2 gap-3 overflow-y-auto px-6 py-4">
            {contentRows.map((c) => (
              <button key={c.id} onClick={() => setContent(c.id)} className={cn("overflow-hidden rounded-lg border text-left transition-colors", content === c.id ? "border-blue-400 ring-2 ring-blue-500/20" : "border-slate-200 hover:border-slate-300")}>
                <div className="relative aspect-[16/9] bg-slate-900">
                  <img src={img(c.seed, 480, 270)} alt="" className="h-full w-full object-cover" />
                  {content === c.id && <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white"><Check className="h-3 w-3" /></span>}
                </div>
                <div className={cn("px-3 py-2", content === c.id && "bg-blue-50/50")}><div className="text-sm font-semibold text-slate-900">{c.name}</div><div className="text-[11px] text-slate-400">{c.type} · {c.items} item{c.items > 1 ? "s" : ""}</div></div>
              </button>
            ))}
          </div>
          <div className="flex justify-between px-6 pb-6"><Button variant="secondary" onClick={() => setPhase("target")}>Back</Button><Button onClick={() => setPhase("review")}>Review ›</Button></div>
        </div>
      )}

      {phase === "review" && (
        <div className="animate-fade-in">
          <div className="space-y-3 px-6 py-5">
            <div className="rounded-lg border border-slate-200 px-4 py-3">
              <SectionLabel>Target</SectionLabel>
              <div className="mt-2 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-500"><Monitor className="h-4 w-4" /></span><div><div className="text-sm font-semibold text-slate-900">{targetLabel}</div><div className="text-[11px] text-slate-400">{targetSub}</div></div></div>
            </div>
            <div className="rounded-lg border border-slate-200 px-4 py-3">
              <SectionLabel>Content</SectionLabel>
              <div className="mt-2 flex items-center gap-3"><img src={img(chosen.seed, 96, 64)} alt="" className="h-8 w-12 rounded object-cover" /><div><div className="text-sm font-semibold text-slate-900">{chosen.name}</div><div className="text-[11px] text-slate-400">{chosen.type} · {chosen.items} items</div></div></div>
            </div>
            <Alert tone="blue" icon={<Info className="h-3.5 w-3.5 shrink-0" />}>Content will be queued and synced immediately. Offline screens will receive the update when they reconnect.</Alert>
          </div>
          <div className="flex justify-between px-6 pb-6"><Button variant="secondary" onClick={() => setPhase("content")}>Back</Button><Button onClick={() => { setProgress(0); setPhase("publishing"); }}><Send className="h-3.5 w-3.5" /> Publish Now</Button></div>
        </div>
      )}

      {phase === "publishing" && (
        <div className="px-6 py-6 animate-fade-in">
          <div className="text-center"><div className="text-sm font-semibold text-slate-900">Publishing content...</div><div className="mt-0.5 text-[11px] text-slate-400">Sending &quot;{chosen.name}&quot; to {targetLabel}</div></div>
          <ul className="mt-5 space-y-2">
            {["Publishing", "Syncing", "Pending acknowledgement", "Synced"].map((s, i) => {
              const done = i < progress; const active = i === progress;
              return (
                <li key={s} className={cn("flex items-center gap-3 rounded-lg border px-4 py-2.5 text-xs font-medium", done ? "border-green-200 bg-green-50 text-green-700" : active ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-400")}>
                  <span className={cn("flex h-5 w-5 items-center justify-center rounded-full", done ? "bg-green-500 text-white" : active ? "bg-blue-600 text-white" : "border border-slate-300")}>
                    {done ? <Check className="h-3 w-3" /> : active ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  </span>
                  {s}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center px-6 py-8 text-center animate-fade-in">
          <SuccessIcon />
          <h3 className="mt-4 text-base font-semibold text-slate-900">Content published</h3>
          <p className="mt-1 text-xs text-slate-600"><span className="font-semibold">&quot;{chosen.name}&quot;</span> has been sent to {targetLabel}.</p>
          <p className="text-[11px] text-slate-400">The screen will sync and begin playing the new content shortly.</p>
          <Button className="mt-5" onClick={close}>Done</Button>
        </div>
      )}
    </Modal>
  );
}
