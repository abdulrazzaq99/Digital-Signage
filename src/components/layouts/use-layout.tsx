"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, SectionLabel } from "@/components/ui/card";
import { Checkbox, PillTabs, SearchInput, UnderlineTabs } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { Alert, SuccessIcon } from "@/components/ui/misc";
import { media, playlists, screens, type ZoneLayout } from "@/lib/data";
import { cn, img } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check, LayoutGrid, LayoutTemplate, Lock, Plus, Save, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ZoneDiagram } from "./templates-page";

type Content = { name: string; sub: string; seed: string };
type Phase = "configure" | "preview" | "select" | "done";

export function UseLayout({ layout }: { layout: ZoneLayout }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("configure");
  const [zoneContent, setZoneContent] = useState<Record<number, Content>>({});
  const [picker, setPicker] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState<"content" | "screen">("screen");
  const [sel, setSel] = useState<string[]>(["lobby-display-01"]);
  const allSet = layout.zoneNames.every((_, i) => zoneContent[i]);
  const crumbs: Record<Phase, [string, string, string]> = { configure: ["/layouts", "Layout", "Configure"], preview: ["#", "Back to Edit", "Preview"], select: ["#", "Back to Preview", "Publish"], done: ["#", "Back to Preview", "Publish"] };
  const [href, label, cur] = crumbs[phase];

  return (
    <div className="space-y-5">
      <UnderlineTabs options={[{ value: "fixed", label: "Fixed Templates", icon: <LayoutTemplate className="h-3.5 w-3.5" /> }, { value: "zones", label: "Multi-zone Layouts", icon: <LayoutGrid className="h-3.5 w-3.5" /> }]} value="zones" onChange={(v) => router.push(v === "fixed" ? "/layouts" : "/layouts?tab=zones")} />
      <div className="flex items-center gap-2 text-xs"><button onClick={() => phase === "configure" ? router.push("/layouts?tab=zones") : setPhase(phase === "preview" ? "configure" : "preview")} className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline"><ArrowLeft className="h-3.5 w-3.5" /> {label}</button><span className="text-slate-300">›</span><span className="text-slate-500">{layout.name}</span><span className="text-slate-300">›</span><span className="text-slate-400">{cur}</span><span className="hidden">{href}</span></div>

      {phase === "configure" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_400px] animate-fade-in">
          <div className="space-y-3">
            <div className="relative rounded-xl border-[6px] border-slate-900 bg-slate-900 shadow-2xl"><span className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-white"><Lock className="h-2.5 w-2.5" /> FIXED LAYOUT</span><ZoneDiagram layout={layout.id} className="w-full rounded-md border-0 bg-blue-50/40 p-3" /></div>
            <Alert tone="blue" className="border-slate-200 bg-slate-50 text-slate-500" icon={<Lock className="h-3.5 w-3.5 shrink-0" />}>Zone geometry is fixed. You can bind or change content but cannot resize, move, add or remove zones.</Alert>
            <div className="flex flex-wrap gap-3 text-[11px] font-medium text-slate-600">{layout.zoneNames.map((n, i) => <span key={n} className="flex items-center gap-1.5"><span className={cn("h-2 w-2 rounded-full", i === 0 ? "bg-blue-600" : "bg-violet-600")} />Zone {i + 1} — {n}</span>)}</div>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Zone Content</h2><p className="text-xs text-slate-400">Assign media or playlists to each fixed zone.</p>
            <div className="mt-4 space-y-2">{layout.zoneNames.map((n, i) => <Card key={n} className="flex items-center justify-between px-4 py-3"><span className="flex items-center gap-3"><span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white", i === 0 ? "bg-blue-600" : "bg-violet-600")}>{i + 1}</span><span><span className="block text-sm font-semibold text-slate-900">Zone {i + 1}</span><span className="block text-[10px] text-slate-400">{zoneContent[i] ? zoneContent[i].name : n}</span></span></span>{zoneContent[i] ? <Button variant="secondary" size="sm" onClick={() => setPicker(i)}>Change</Button> : <Button size="sm" onClick={() => setPicker(i)}><Plus className="h-3.5 w-3.5" /> Select Content</Button>}</Card>)}</div>
          </div>
        </div>
      )}

      {phase === "preview" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_340px] animate-fade-in">
          <div>
            <PillTabs options={[{ value: "content", label: "Content Preview" }, { value: "screen", label: "On Screen Preview" }]} value={previewMode} onChange={setPreviewMode} />
            <div className={cn("mt-3", previewMode === "screen" && "rounded-2xl bg-slate-900 p-8 pb-12")}>
              <div className={cn("relative overflow-hidden bg-slate-800", previewMode === "screen" ? "rounded-md border-4 border-slate-700" : "rounded-xl")}>
                {previewMode === "screen" && <span className="absolute right-3 top-2 z-10 flex items-center gap-1 text-[9px] text-green-400"><span className="h-1.5 w-1.5 rounded-full bg-green-400" />LIVE</span>}
                <div className={cn("aspect-video", layout.id === "main-bottom-bar" ? "flex flex-col gap-1 p-1" : layout.id === "split-screen" ? "flex gap-1 p-1" : "p-1")}>
                  {layout.zoneNames.map((n, i) => <div key={n} className={cn("relative overflow-hidden rounded", layout.id === "main-bottom-bar" ? (i === 0 ? "flex-[3]" : "flex-1") : "flex-1 h-full")}>{zoneContent[i] && <img src={img(zoneContent[i].seed, 960, 540)} alt="" className="h-full w-full object-cover" />}<span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-white">Zone {i + 1}</span></div>)}
                </div>
              </div>
              {previewMode === "screen" && <div className="mx-auto mt-2 h-3 w-24 rounded-b-lg bg-slate-700" />}
            </div>
          </div>
          <div className="space-y-4">
            <Card><CardHeader title={layout.name} subtitle={`${layout.zones} zone${layout.zones > 1 ? "s" : ""} · Landscape · 16:9`} /><dl className="divide-y divide-slate-100 px-5 text-xs">{[["Layout", layout.name], ["Orientation", "Landscape · 16:9"], ["Zones", `${layout.zones} zone${layout.zones > 1 ? "s" : ""}`], ["Resolution", "1920 × 1080"]].map(([k, v]) => <div key={k} className="flex justify-between py-2.5"><dt className="text-slate-400">{k}</dt><dd className="font-semibold text-slate-800">{v}</dd></div>)}</dl></Card>
            <Card className="px-5 py-4"><SectionLabel>Zone Content Summary</SectionLabel><ul className="mt-2 space-y-2">{layout.zoneNames.map((n, i) => <li key={n} className="flex items-center gap-3 text-xs"><span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white", i === 0 ? "bg-blue-600" : "bg-violet-600")}>{i + 1}</span><span className="flex-1"><span className="block font-semibold text-slate-800">Zone {i + 1} — {n}</span><span className="block text-[10px] text-slate-400">{zoneContent[i]?.name} · {zoneContent[i]?.sub}</span></span>{zoneContent[i] && <img src={img(zoneContent[i].seed, 48, 32)} alt="" className="h-5 w-8 rounded object-cover" />}</li>)}</ul></Card>
            <Alert tone="green" icon={<Check className="h-3.5 w-3.5 shrink-0" />}>All zones are configured. Ready to save or publish.</Alert>
            <Button variant="success" className="w-full" onClick={() => setPhase("select")}><Send className="h-3.5 w-3.5" /> Save &amp; Publish</Button>
            <Button variant="secondary" className="w-full" onClick={() => router.push("/layouts?tab=zones")}><Save className="h-3.5 w-3.5" /> Save</Button>
          </div>
        </div>
      )}

      {phase === "select" && (
        <div className="max-w-md animate-fade-in">
          <h2 className="text-base font-bold text-slate-900">Publish Layout</h2><p className="text-xs text-slate-400">Select screens to receive &quot;{layout.name}&quot;.</p>
          <SectionLabel className="mt-5">Select Screens</SectionLabel>
          <ul className="mt-2 space-y-1.5">{screens.slice(0, 5).map((s) => <li key={s.id}><button onClick={() => setSel((x) => x.includes(s.id) ? x.filter((y) => y !== s.id) : [...x, s.id])} className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left", sel.includes(s.id) ? "border-blue-300 bg-blue-50/50" : "border-slate-200 hover:bg-slate-50")}><Checkbox checked={sel.includes(s.id)} /><span className="flex-1 text-xs font-semibold text-slate-900">{s.name}</span><Badge tone={s.status === "Online" ? "green" : "slate"}>{s.status === "Online" ? "Online" : "Offline"}</Badge></button></li>)}</ul>
          <div className="mt-5 flex justify-center gap-2"><Button variant="secondary" onClick={() => setPhase("preview")}>Cancel</Button><Button disabled={!sel.length} onClick={() => setPhase("done")}>Next <ArrowRight className="h-3.5 w-3.5" /></Button></div>
        </div>
      )}

      {phase === "done" && (
        <div className="max-w-md animate-fade-in">
          <h2 className="text-base font-bold text-slate-900">Publish Layout</h2><p className="text-xs text-slate-400">Select screens to receive &quot;{layout.name}&quot;.</p>
          <div className="mt-6 flex flex-col items-center text-center"><SuccessIcon /><div className="mt-3 text-sm font-semibold text-slate-900">Published Successfully</div><div className="text-[11px] text-slate-400">&quot;{layout.name}&quot; is now live on selected screens.</div></div>
          <ul className="mt-4 space-y-1.5">{screens.filter((s) => sel.includes(s.id)).map((s) => <li key={s.id} className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs"><span className="flex items-center gap-2 font-medium text-green-800"><Check className="h-3.5 w-3.5" /> {s.name}</span><span className="font-semibold text-green-600">Synced</span></li>)}</ul>
          <Button className="mt-4 w-full" onClick={() => router.push("/layouts?tab=zones")}>Done</Button>
        </div>
      )}

      {phase === "configure" && (
        <div className="flex justify-between"><Button variant="secondary" onClick={() => router.push("/layouts?tab=zones")}><ArrowLeft className="h-3.5 w-3.5" /> Back</Button><div className="flex gap-2"><Button variant="secondary"><Save className="h-3.5 w-3.5" /> Save Draft</Button><Button disabled={!allSet} onClick={() => setPhase("preview")}>Preview Layout <ArrowRight className="h-3.5 w-3.5" /></Button></div></div>
      )}

      <SelectContentModal zone={picker} onClose={() => setPicker(null)} onPick={(c) => { if (picker !== null) setZoneContent((z) => ({ ...z, [picker]: c })); setPicker(null); }} />
    </div>
  );
}

function SelectContentModal({ zone, onClose, onPick }: { zone: number | null; onClose: () => void; onPick: (c: Content) => void }) {
  const [tab, setTab] = useState<"media" | "playlists">("playlists");
  const rows: Content[] = tab === "playlists" ? [...playlists.map((p) => ({ name: p.name, sub: `Playlist · ${p.items.length} items`, seed: p.seed })), { name: "Fresh Bites Daily Menu", sub: "Playlist · 6 items", seed: "cafe" }, { name: "Acme Spring Campaign", sub: "Playlist · 5 items", seed: "atrium" }, { name: "Travel Highlights Reel", sub: "Playlist · 4 items", seed: "hotel" }] : media.filter((m) => m.status === "Ready").map((m) => ({ name: m.name, sub: `${m.type} · ${m.size}`, seed: m.seed }));
  return (
    <Modal open={zone !== null} onClose={onClose} width="max-w-[640px]">
      <ModalHeader title="Select Content" subtitle={`Assigning to Zone ${(zone ?? 0) + 1}`} onClose={onClose} />
      <div className="flex items-center justify-between px-6 pt-3"><div className="-mb-px flex gap-5 border-b border-slate-200">{(["media", "playlists"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={cn("border-b-2 pb-2 text-xs font-medium capitalize", tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500")}>{t}</button>)}</div><SearchInput placeholder="Search..." className="w-44" /></div>
      <div className="grid max-h-[320px] grid-cols-3 gap-3 overflow-y-auto px-6 py-4">{rows.map((c) => <button key={c.name} onClick={() => onPick(c)} className="overflow-hidden rounded-lg border border-slate-200 text-left hover:border-blue-300"><div className="relative aspect-video bg-slate-900"><img src={img(c.seed, 480, 270)} alt="" className="h-full w-full object-cover" /><Badge tone={tab === "playlists" ? "purple" : "blue"} className="absolute left-2 top-2">{tab === "playlists" ? "PLAYLIST" : "MEDIA"}</Badge></div><div className="px-3 py-2"><div className="truncate text-xs font-semibold text-slate-900">{c.name}</div><div className="text-[10px] text-slate-400">{c.sub}</div></div></button>)}</div>
    </Modal>
  );
}
