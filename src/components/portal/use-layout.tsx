"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal, ModalHeader } from "@/components/ui/modal";
import type { ZoneLayout } from "@/lib/data";
import { portalMedia, portalPlaylists } from "@/lib/portal-data";
import { cn, img } from "@/lib/utils";
import { Check, Eye, ListVideo, Lock, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLinkButton } from "./portal-stepper";
import { PublishTarget } from "./publish-target";
import { ApiError } from "@/lib/api/client";

type Content = { name: string; kind: "PLAYLIST" | "MEDIA"; seed: string };
const zoneNames: Record<string, string[]> = { "full-screen": ["Main Zone"], "main-sidebar": ["Main Zone", "Sidebar"], "main-bottom-bar": ["Main Zone", "Bottom Bar"], "split-screen": ["Left Zone", "Right Zone"], "main-two-side": ["Main Zone", "Side Top", "Side Bottom"] };

export function PortalUseLayout({ layout }: { layout: ZoneLayout }) {
  const router = useRouter();
  const names = zoneNames[layout.id] ?? layout.zoneNames;
  const [assigned, setAssigned] = useState<Record<number, Content>>({});
  const [picker, setPicker] = useState<number | null>(null);
  const [phase, setPhase] = useState<"configure" | "publish">("configure");
  const missing = names.filter((_, i) => !assigned[i]);
  const cell = (i: number, cls: string) => <div key={i} className={cn("flex flex-col items-center justify-center rounded-sm border text-center", assigned[i] ? "border-blue-400/40 bg-slate-800" : "border-blue-400/30 bg-blue-950/60", cls)}><span className="text-[8px] font-semibold uppercase tracking-wider text-blue-300">{names[i]}</span><span className="mt-0.5 max-w-[90%] truncate text-[7px] text-slate-400">{assigned[i] ? assigned[i].name : "Required"}</span></div>;

  if (phase === "publish") return <PublishTarget subject={layout.name} onPublish={() => Promise.reject(new ApiError(501, "NOT_IMPLEMENTED", "Publishing from this flow is wired in a later step."))} onBack={() => setPhase("configure")} onDone={() => router.push("/portal/layouts")} />;

  return (
    <div className="space-y-4">
      <BackLinkButton label="Layouts" onClick={() => router.push("/portal/layouts")} />
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-bold tracking-tight text-slate-900">{layout.name}</h1><p className="text-xs text-slate-400">Assign content to each zone below.</p></div><Button disabled={missing.length > 0} onClick={() => setPhase("publish")}><Eye className="h-3.5 w-3.5" /> Preview</Button></div>
      {missing.length > 0 && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">Required zones not yet assigned: {missing.join(", ")}.</div>}
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Layout Preview</div>
          <div className="mt-2 aspect-video overflow-hidden rounded-xl border-4 border-slate-800 bg-slate-900 p-2">
            <div className={cn("flex h-full w-full gap-1.5", layout.id === "main-bottom-bar" && "flex-col")}>
              {layout.id === "full-screen" && cell(0, "flex-1")}
              {layout.id === "main-sidebar" && <>{cell(0, "flex-[7]")}{cell(1, "flex-[3]")}</>}
              {layout.id === "main-bottom-bar" && <>{cell(0, "flex-[3]")}{cell(1, "flex-1")}</>}
              {layout.id === "split-screen" && <>{cell(0, "flex-1")}{cell(1, "flex-1")}</>}
              {layout.id === "main-two-side" && <>{cell(0, "flex-[68]")}<div className="flex flex-[32] flex-col gap-1.5">{cell(1, "flex-1")}{cell(2, "flex-1")}</div></>}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500"><Lock className="h-3 w-3" /> Zone positions, sizes, and layout geometry are locked.</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Content Assignment</div>
          <div className="mt-2 space-y-3">
            {names.map((n, i) => (
              <Card key={n} className="p-4">
                <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-semibold text-slate-900"><span className={cn("h-3 w-3 rounded-sm border-2", assigned[i] ? "border-blue-600 bg-blue-600" : "border-blue-600")} />{n}<span className="text-[10px] font-medium text-red-500">Required</span></span>{assigned[i] && <span className="flex items-center gap-1 text-[10px] font-medium text-green-600"><Check className="h-3 w-3" /> Assigned</span>}</div>
                {assigned[i] ? (
                  <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 animate-fade-in"><span className="flex h-8 w-8 items-center justify-center rounded bg-slate-200 text-slate-500">{assigned[i].kind === "PLAYLIST" ? <ListVideo className="h-4 w-4" /> : <img src={img(assigned[i].seed, 64, 64)} alt="" className="h-8 w-8 rounded object-cover" />}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-900">{assigned[i].name}</span><span className="block text-[9px] font-semibold uppercase tracking-wider text-slate-400">{assigned[i].kind}</span></span><Button size="sm" variant="secondary" onClick={() => setPicker(i)}>Replace</Button><button onClick={() => setAssigned((a) => { const c = { ...a }; delete c[i]; return c; })} className="flex h-7 w-7 items-center justify-center rounded border border-red-200 text-red-500 hover:bg-red-50"><X className="h-3.5 w-3.5" /></button></div>
                ) : (
                  <button onClick={() => setPicker(i)} className="mt-3 flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 text-xs font-medium text-slate-500 hover:border-blue-300 hover:text-blue-600"><Plus className="h-3.5 w-3.5" /> Select Media or Playlist</button>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
      <AssignContentModal zone={picker === null ? null : names[picker]} onClose={() => setPicker(null)} onPick={(c) => { if (picker !== null) setAssigned((a) => ({ ...a, [picker]: c })); setPicker(null); }} />
    </div>
  );
}

function AssignContentModal({ zone, onClose, onPick }: { zone: string | null; onClose: () => void; onPick: (c: Content) => void }) {
  const [tab, setTab] = useState<"media" | "playlist">("media");
  return (
    <Modal open={zone !== null} onClose={onClose} width="max-w-[480px]">
      <ModalHeader title="Assign Content" subtitle={<>Zone: <span className="font-semibold text-slate-800">{zone}</span></>} onClose={onClose} />
      <div className="px-6 pt-3"><div className="-mb-px flex gap-5 border-b border-slate-200">{(["media", "playlist"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={cn("border-b-2 pb-2 text-xs font-medium capitalize", tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500")}>{t}</button>)}</div></div>
      <div className="max-h-[340px] overflow-y-auto px-6 py-4">
        {tab === "media" ? (
          <div className="grid grid-cols-2 gap-3">{portalMedia.filter((m) => m.status === "Ready" && m.type === "JPG/PNG").map((m) => <button key={m.id} onClick={() => onPick({ name: m.name.replace(/\.[a-z0-9]+$/i, ""), kind: "MEDIA", seed: m.seed })} className="overflow-hidden rounded-lg border border-slate-200 text-left hover:border-blue-300"><img src={img(m.seed, 320, 180)} alt="" className="aspect-video w-full object-cover" /><span className="block truncate px-2 py-1.5 text-[11px] font-medium text-slate-800">{m.name.replace(/\.[a-z0-9]+$/i, "")}</span></button>)}</div>
        ) : (
          <ul className="space-y-2">{portalPlaylists.map((p) => <li key={p.id}><button onClick={() => onPick({ name: p.name, kind: "PLAYLIST", seed: p.items[0]?.seed ?? "office" })} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-left hover:border-blue-300"><span className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-slate-500"><ListVideo className="h-4 w-4" /></span><span><span className="block text-xs font-semibold text-slate-900">{p.name}</span><span className="block text-[10px] text-slate-400">{p.items.length} items</span></span></button></li>)}</ul>
        )}
      </div>
      <div className="px-6 pb-5"><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button></div>
    </Modal>
  );
}
