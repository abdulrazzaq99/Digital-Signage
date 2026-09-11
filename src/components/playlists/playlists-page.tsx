"use client";
import { Button } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { FilterSelect, PillTabs, SearchInput, Select } from "@/components/ui/input";
import { DropdownMenu, PageHeader } from "@/components/ui/misc";
import { fmtDuration, playlists, type Playlist } from "@/lib/data";
import { cn, img } from "@/lib/utils";
import { Copy, Eye, LayoutGrid, List, ListVideo, Pencil, Plus, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DeletePlaylistModal, PreviewPlaylistModal, PublishPlaylistModal } from "./playlist-modals";
import { RenameModal } from "@/components/media/media-modals";

export function PlaylistsPage() {
  const [ctx, setCtx] = useState<"personal" | "customer">("customer");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState("");
  const [preview, setPreview] = useState<Playlist | null>(null);
  const [publish, setPublish] = useState<Playlist | null>(null);
  const [rename, setRename] = useState<Playlist | null>(null);
  const [del, setDel] = useState<Playlist | null>(null);
  const list = playlists.filter((p) => (ctx === "personal" ? p.company === "Personal" : p.company !== "Personal") && p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <PageHeader title="Playlists" subtitle="Create, organize and publish content playlists to your screens." action={<Button href="/playlists/new"><Plus className="h-4 w-4" /> Create Playlist</Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard value={list.length} label="Total Playlists" sub="Across all contexts" />
        <StatCard value={list.filter((p) => p.assigned > 0).length} label="Published / Assigned" sub="Active on screens" tone="blue" />
        <StatCard value={list.filter((p) => p.assigned === 0).length} label="Unassigned" sub="Not yet deployed" />
      </div>
      <Card className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span className="text-xs font-semibold text-slate-700">Playlist Context:</span>
        <PillTabs options={[{ value: "personal", label: "Personal" }, { value: "customer", label: "Customer Company" }]} value={ctx} onChange={setCtx} />
        {ctx === "customer" && <div className="flex items-center gap-2 text-xs text-slate-500">Company: <Select className="w-36 [&>select]:h-8" defaultValue="acme"><option value="acme">Acme Retail</option><option>City Mall</option></Select></div>}
        <span className="ml-auto text-[11px] text-slate-400">Showing playlists for {ctx === "customer" ? "Acme Retail" : "Super Admin"}</span>
      </Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2"><SearchInput placeholder="Search playlists..." className="w-56" value={q} onChange={(e) => setQ(e.target.value)} /><FilterSelect label="All Statuses" /><span className="text-xs text-slate-500">Sort:</span><FilterSelect label="Last Updated" /><span className="text-xs text-slate-400">{list.length} playlists</span></div>
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5"><button onClick={() => setView("grid")} className={cn("flex h-7 w-7 items-center justify-center rounded-md", view === "grid" ? "bg-blue-50 text-blue-600" : "text-slate-400")}><LayoutGrid className="h-3.5 w-3.5" /></button><button onClick={() => setView("list")} className={cn("flex h-7 w-7 items-center justify-center rounded-md", view === "list" ? "bg-blue-50 text-blue-600" : "text-slate-400")}><List className="h-3.5 w-3.5" /></button></div>
      </div>

      <div className={cn(view === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-2")}>
        {list.map((p) => {
          const total = p.items.reduce((a, b) => a + b.duration, 0);
          return (
            <div key={p.id} className={cn("overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm", view === "list" && "flex items-center")}>
              <button onClick={() => setPreview(p)} className={cn("relative block bg-slate-900", view === "list" ? "w-44 shrink-0" : "w-full")}>
                <img src={img(p.seed, 640, 360)} alt="" className="aspect-video w-full object-cover" />
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white"><ListVideo className="h-3 w-3" /> {p.items.length}</span>
                <span className="absolute bottom-2 left-2 flex gap-0.5">{p.items.slice(0, 8).map((it, i) => <span key={it.id} className={cn("h-1.5 w-1.5 rounded-full", i === 0 ? "bg-blue-500" : "bg-white/60")} />)}</span>
              </button>
              <div className="flex-1 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/playlists/${p.id}/edit`} className="text-sm font-semibold text-slate-900 hover:text-blue-600">{p.name}</Link>
                  <DropdownMenu items={[{ label: "Edit Playlist", icon: <Pencil className="h-3.5 w-3.5" />, href: `/playlists/${p.id}/edit` }, { label: "Preview", icon: <Eye className="h-3.5 w-3.5" />, onSelect: () => setPreview(p) }, { label: "Publish", icon: <Send className="h-3.5 w-3.5" />, onSelect: () => setPublish(p) }, { label: "Duplicate", icon: <Copy className="h-3.5 w-3.5" /> }, { label: "Rename", icon: <Pencil className="h-3.5 w-3.5" />, onSelect: () => setRename(p) }, { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, tone: "danger", onSelect: () => setDel(p) }]} />
                </div>
                <div className="mt-1 text-[11px] text-slate-500">{p.items.length} items · {fmtDuration(total)}</div>
                <div className="text-[11px] text-slate-400">Updated {p.updated}</div>
                <div className={cn("mt-2 flex items-center gap-1.5 text-[11px] font-medium", p.assigned ? "text-green-600" : "text-slate-400")}><span className={cn("h-1.5 w-1.5 rounded-full", p.assigned ? "bg-green-500" : "bg-slate-300")} />{p.assigned ? `Assigned to ${p.assigned} Screens/Groups` : "Not Assigned"}</div>
              </div>
            </div>
          );
        })}
      </div>

      <PreviewPlaylistModal key={preview?.id} playlist={preview} onClose={() => setPreview(null)} />
      <PublishPlaylistModal key={publish?.id} playlist={publish} onClose={() => setPublish(null)} />
      <RenameModal open={!!rename} onClose={() => setRename(null)} name={rename?.name ?? ""} kind="Playlist" />
      <DeletePlaylistModal playlist={del} onClose={() => setDel(null)} />
    </div>
  );
}
