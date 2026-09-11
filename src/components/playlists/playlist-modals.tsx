"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox, Input, Label, PillTabs, RadioCard, SearchInput, Select } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { SectionLabel } from "@/components/ui/card";
import { Alert, SuccessIcon } from "@/components/ui/misc";
import { fmtDuration, media, screenGroups, screens, type Playlist } from "@/lib/data";
import { cn, img } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight, FileText, Info, Send, Trash2, X } from "lucide-react";
import { useState } from "react";

export function PreviewPlaylistModal({ playlist, onClose }: { playlist: Playlist | null; onClose: () => void }) {
  const [i, setI] = useState(0);
  if (!playlist) return null;
  const total = playlist.items.reduce((a, b) => a + b.duration, 0);
  const cur = playlist.items[Math.min(i, playlist.items.length - 1)];
  return (
    <Modal open onClose={onClose} width="max-w-[700px]">
      <div className="flex items-start justify-between px-5 pt-4"><div><div className="text-sm font-semibold text-slate-900">{playlist.name}</div><div className="text-[11px] text-slate-400">{playlist.items.length} items · {fmtDuration(total)}</div></div><button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50"><X className="h-3.5 w-3.5" /></button></div>
      <div className="mt-3 relative bg-slate-900">
        <img src={img(cur.seed, 1200, 675)} alt="" className="aspect-video w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10 text-white"><div className="text-sm font-semibold">{cur.name}</div><div className="text-[10px] text-white/70">{cur.duration}s · {cur.type.toUpperCase()}</div></div>
      </div>
      <div className="flex gap-1.5 bg-slate-50 px-4 py-2.5">{playlist.items.map((it, idx) => <button key={it.id} onClick={() => setI(idx)} className={cn("h-8 w-12 overflow-hidden rounded border-2", idx === i ? "border-blue-600" : "border-transparent")}><img src={img(it.seed, 96, 64)} alt="" className="h-full w-full object-cover" /></button>)}</div>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}><ChevronLeft className="h-3.5 w-3.5" /> Prev</Button><Button variant="secondary" size="sm" onClick={() => setI((v) => Math.min(playlist.items.length - 1, v + 1))} disabled={i === playlist.items.length - 1}>Next <ChevronRight className="h-3.5 w-3.5" /></Button></div>
        <span className="text-[11px] text-slate-400">{i + 1} of {playlist.items.length}</span>
        <Button size="sm" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}

export function DeletePlaylistModal({ playlist, onClose }: { playlist: Playlist | null; onClose: () => void }) {
  return (
    <Modal open={!!playlist} onClose={onClose} width="max-w-[420px]">
      {playlist && (
        <>
          <div className="flex items-center justify-between px-5 pt-4"><div className="flex items-center gap-2.5"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 className="h-3.5 w-3.5" /></span><span className="text-sm font-semibold text-slate-900">Delete Playlist?</span></div><button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-400"><X className="h-3.5 w-3.5" /></button></div>
          <p className="px-5 pt-4 text-xs leading-5 text-slate-500">Are you sure you want to permanently delete <span className="font-semibold text-slate-800">&quot;{playlist.name}&quot;</span>?<br /><span className="text-blue-500">This action cannot be undone.</span></p>
          <div className="flex justify-end gap-2 px-5 py-4"><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button><Button variant="danger" size="sm" onClick={onClose}>Delete Playlist</Button></div>
        </>
      )}
    </Modal>
  );
}

export function AddMediaModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (ids: string[]) => void }) {
  const [filter, setFilter] = useState<"All" | "Images" | "Videos" | "PDFs">("All");
  const [sel, setSel] = useState<string[]>([]);
  const rows = media.filter((m) => m.status === "Ready" && (filter === "All" || (filter === "Images" ? m.type === "Image" : filter === "Videos" ? m.type === "Video" : m.type === "PDF")));
  const close = () => { onClose(); setSel([]); };
  return (
    <Modal open={open} onClose={close} width="max-w-[680px]">
      <ModalHeader title="Add Media" subtitle="Select media from your library to add to this playlist." onClose={close} />
      <div className="flex items-center gap-3 px-6 pt-4"><SearchInput placeholder="Search media..." className="flex-1" /><PillTabs options={[{ value: "All", label: "All" }, { value: "Images", label: "Images" }, { value: "Videos", label: "Videos" }, { value: "PDFs", label: "PDFs" }]} value={filter} onChange={setFilter} /></div>
      <div className="grid max-h-[340px] grid-cols-3 gap-3 overflow-y-auto px-6 py-4">
        {rows.map((m) => {
          const on = sel.includes(m.id);
          return (
            <button key={m.id} onClick={() => setSel((s) => on ? s.filter((x) => x !== m.id) : [...s, m.id])} className={cn("overflow-hidden rounded-lg border text-left transition-colors", on ? "border-blue-400 ring-2 ring-blue-500/20" : "border-slate-200 hover:border-slate-300")}>
              <div className="relative aspect-video bg-slate-900">{m.type === "PDF" ? <div className="flex h-full items-center justify-center bg-red-50 text-red-500"><FileText className="h-6 w-6" /></div> : <img src={img(m.seed, 480, 270)} alt="" className="h-full w-full object-cover" />}{on && <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white"><Check className="h-3 w-3" /></span>}</div>
              <div className={cn("px-3 py-2", on && "bg-blue-50/50")}><div className="truncate text-xs font-semibold text-slate-900">{m.name}</div><div className="mt-1 flex items-center gap-1.5"><Badge tone={m.type === "Image" ? "purple" : m.type === "Video" ? "blue" : "red"}>{m.type.toUpperCase()}</Badge><span className="text-[10px] text-slate-400">{m.type === "Video" ? m.duration : m.type === "PDF" ? m.meta : m.size}</span></div></div>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4"><span className="text-xs font-medium text-blue-600">{sel.length} item{sel.length !== 1 ? "s" : ""} selected</span><div className="flex gap-2"><Button variant="secondary" onClick={close}>Cancel</Button><Button disabled={!sel.length} onClick={() => { onAdd(sel); close(); }}>Add Selected ({sel.length})</Button></div></div>
    </Modal>
  );
}

export function PublishPlaylistModal({ playlist, onClose }: { playlist: Playlist | null; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<"screens" | "groups">("screens");
  const [sel, setSel] = useState<string[]>([]);
  const [timing, setTiming] = useState<"now" | "schedule">("now");
  const [done, setDone] = useState(false);
  const close = () => { onClose(); setTimeout(() => { setStep(1); setSel([]); setTiming("now"); setDone(false); }, 200); };
  if (!playlist) return null;
  const total = playlist.items.reduce((a, b) => a + b.duration, 0);
  const targets = mode === "screens" ? screens.slice(0, 5).map((s) => ({ id: s.id, name: s.name, status: s.status, sub: `Current: ${s.content}` })) : screenGroups.map((g) => ({ id: g.id, name: g.name, status: "Online", sub: `${g.screens} screens · ${g.company}` }));
  const chosen = targets.filter((t) => sel.includes(t.id));

  return (
    <Modal open onClose={close} width="max-w-[520px]">
      <div className="flex items-start justify-between px-6 pt-5"><div><div className="text-sm font-semibold text-slate-900">Publish Playlist</div><div className="mt-1 flex items-center gap-2 text-xs"><img src={img(playlist.seed, 48, 32)} alt="" className="h-4 w-6 rounded-sm object-cover" /><span className="font-medium text-slate-800">{playlist.name}</span><span className="text-slate-400">{playlist.items.length} items · {fmtDuration(total)}</span></div></div><button onClick={close} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-400"><X className="h-3.5 w-3.5" /></button></div>
      {!done && (
        <div className="flex items-center justify-between px-6 pt-4"><span className="text-xs font-semibold text-slate-700">{step} — {["Select Target", "Timing", "Review"][step - 1]}</span><div className="flex items-center gap-1">{[1, 2, 3].map((n) => <span key={n} className="flex items-center gap-1">{n > 1 && <span className={cn("h-px w-4", n <= step ? "bg-green-400" : "bg-slate-200")} />}<span className={cn("flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-semibold", n < step ? "bg-green-500 text-white" : n === step ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400")}>{n < step ? <Check className="h-2.5 w-2.5" /> : n}</span></span>)}</div></div>
      )}

      {!done && step === 1 && (
        <div className="px-6 py-4 animate-fade-in">
          <SectionLabel>Target Type</SectionLabel>
          <PillTabs className="mt-2" options={[{ value: "screens", label: "Screens" }, { value: "groups", label: "Screen Groups" }]} value={mode} onChange={(v) => { setMode(v); setSel([]); }} />
          <div className="mt-4 flex items-center justify-between"><SectionLabel>{mode === "screens" ? "Screens — Acme Retail" : "Groups — Acme Retail"}</SectionLabel><button onClick={() => setSel(targets.map((t) => t.id))} className="text-[11px] font-medium text-blue-600 hover:underline">Select All</button></div>
          <ul className="mt-2 max-h-[220px] space-y-1.5 overflow-y-auto">
            {targets.map((t) => <li key={t.id}><button onClick={() => setSel((s) => s.includes(t.id) ? s.filter((x) => x !== t.id) : [...s, t.id])} className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left", sel.includes(t.id) ? "border-blue-300 bg-blue-50/50" : "border-slate-200 hover:bg-slate-50")}><Checkbox checked={sel.includes(t.id)} /><span className="flex-1"><span className="flex items-center gap-2 text-xs font-semibold text-slate-900">{t.name}<Badge tone={t.status === "Online" ? "green" : "slate"}>{t.status}</Badge></span><span className="block text-[10px] text-slate-400">{t.sub}</span></span></button></li>)}
          </ul>
          <div className="mt-4 flex justify-between"><Button variant="secondary" size="sm" onClick={close}>Cancel</Button><Button size="sm" disabled={!sel.length} onClick={() => setStep(2)}>Next <ChevronRight className="h-3.5 w-3.5" /></Button></div>
        </div>
      )}

      {!done && step === 2 && (
        <div className="px-6 py-4 animate-fade-in">
          <SectionLabel>Publishing Timing</SectionLabel>
          <div className="mt-2 space-y-2">
            <RadioCard checked={timing === "now"} onSelect={() => setTiming("now")} title="Publish Now" sub="Content will go live immediately after syncing." />
            <RadioCard checked={timing === "schedule"} onSelect={() => setTiming("schedule")} title="Schedule" sub="Set a specific start (and optional end) date and time." />
          </div>
          {timing === "schedule" && (
            <div className="mt-3 space-y-3 rounded-lg border border-slate-200 p-4 animate-fade-in">
              <div><Label required>Start Date &amp; Time</Label><div className="grid grid-cols-2 gap-2"><Input type="date" /><Input type="time" defaultValue="09:00" /></div></div>
              <div><Label>End Date &amp; Time <span className="font-normal text-slate-400">(optional)</span></Label><div className="grid grid-cols-2 gap-2"><Input type="date" /><Input type="time" /></div></div>
              <div><Label>Timezone</Label><Select defaultValue="UTC"><option>UTC</option><option>Europe/London</option><option>America/New_York</option></Select></div>
            </div>
          )}
          <div className="mt-4 flex justify-between"><Button variant="secondary" size="sm" onClick={() => setStep(1)}><ChevronLeft className="h-3.5 w-3.5" /> Back</Button><div className="flex gap-2"><Button variant="secondary" size="sm" onClick={close}>Cancel</Button><Button size="sm" onClick={() => setStep(3)}>Next <ChevronRight className="h-3.5 w-3.5" /></Button></div></div>
        </div>
      )}

      {!done && step === 3 && (
        <div className="px-6 py-4 animate-fade-in">
          <SectionLabel>Publish Summary</SectionLabel>
          <dl className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200 px-4 text-xs">
            <div className="flex justify-between py-2.5"><dt className="text-slate-400">Playlist</dt><dd className="font-semibold text-slate-800">{playlist.name}</dd></div>
            <div className="flex justify-between py-2.5"><dt className="text-slate-400">{mode === "screens" ? "Screens" : "Groups"}</dt><dd className="flex items-center gap-1.5 font-semibold text-slate-800">{chosen.length === 1 ? chosen[0].name : `${chosen.length} selected`}<span className="h-1.5 w-1.5 rounded-full bg-green-500" /></dd></div>
            <div className="flex justify-between py-2.5"><dt className="text-slate-400">Timing</dt><dd className="font-semibold text-slate-800">{timing === "now" ? "Immediately" : "at 09:00 (UTC)"}</dd></div>
          </dl>
          <Alert tone="blue" className="mt-3" icon={<Info className="h-3.5 w-3.5 shrink-0" />}>Current content on selected screens will be replaced.</Alert>
          <div className="mt-4 flex justify-between"><Button variant="secondary" size="sm" onClick={() => setStep(2)}><ChevronLeft className="h-3.5 w-3.5" /> Back</Button><div className="flex gap-2"><Button variant="secondary" size="sm" onClick={close}>Cancel</Button><Button variant="success" size="sm" onClick={() => setDone(true)}><Send className="h-3.5 w-3.5" /> Publish Playlist</Button></div></div>
        </div>
      )}

      {done && (
        <div className="flex flex-col items-center px-6 py-6 text-center animate-fade-in">
          <SuccessIcon />
          <div className="mt-3 text-sm font-semibold text-slate-900">Published Successfully</div>
          <div className="text-[11px] text-slate-400">All targets have received the playlist assignment.</div>
          <ul className="mt-4 w-full space-y-1.5">{chosen.map((t) => <li key={t.id} className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs"><span className="flex items-center gap-2 font-medium text-green-800"><Check className="h-3.5 w-3.5" /> {t.name}</span><span className="font-semibold text-green-600">Synced</span></li>)}</ul>
          <Button className="mt-4 w-full" onClick={close}>Done</Button>
        </div>
      )}
    </Modal>
  );
}
