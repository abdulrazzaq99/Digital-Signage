"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, StatCard } from "@/components/ui/card";
import { FilterSelect, PillTabs, SearchInput, Select } from "@/components/ui/input";
import { DropdownMenu, PageHeader } from "@/components/ui/misc";
import { media, type MediaItem } from "@/lib/data";
import { cn, img } from "@/lib/utils";
import { Eye, FileText, LayoutGrid, List, Loader2, Pencil, Play, RefreshCw, Trash2, Upload, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PreviewMediaModal, RemoveMediaModal, RenameModal, UploadMediaModal } from "./media-modals";

function Thumb({ m }: { m: MediaItem }) {
  if (m.status === "Failed") return <div className="flex aspect-video flex-col items-center justify-center gap-1.5 bg-red-800/80 text-white"><XCircle className="h-6 w-6" /><span className="text-[10px]">Upload Failed</span></div>;
  if (m.status === "Processing") return <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-slate-800 text-white"><Loader2 className="h-6 w-6 animate-spin" /><span className="text-[10px] text-slate-300">Processing...</span></div>;
  if (m.type === "PDF") return <div className="flex aspect-video flex-col items-center justify-center gap-1 bg-red-50 text-red-500"><FileText className="h-7 w-7" /><span className="text-[10px] font-semibold">PDF</span></div>;
  return <div className="relative aspect-video bg-slate-900"><img src={img(m.seed, 480, 270)} alt="" className="h-full w-full object-cover" />{m.type === "Video" && <span className="absolute inset-0 m-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"><Play className="h-3.5 w-3.5 fill-current" /></span>}</div>;
}

export function MediaLibrary() {
  const [ctx, setCtx] = useState<"personal" | "customer">("customer");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState("");
  const [upload, setUpload] = useState(false);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [rename, setRename] = useState<MediaItem | null>(null);
  const [remove, setRemove] = useState<MediaItem | null>(null);
  const list = media.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <PageHeader title="Media Library" subtitle="Upload and manage content used across your screens." action={<div className="text-right"><Button onClick={() => setUpload(true)}><Upload className="h-4 w-4" /> Upload Media</Button><div className="mt-1 text-[10px] text-slate-400">JPG, PNG, MP4 and PDF</div></div>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard value="7" label="Media Files" sub="Total uploads" />
        <StatCard value="0.2 GB" label="Storage Used" sub="Across all files" />
        <StatCard value="1" label="Processing" sub="Being encoded" />
      </div>
      <Card className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span className="text-xs font-semibold text-slate-700">Media Context:</span>
        <PillTabs options={[{ value: "personal", label: "Personal Media" }, { value: "customer", label: "Customer Company" }]} value={ctx} onChange={setCtx} />
        {ctx === "customer" && <div className="flex items-center gap-2 text-xs text-slate-500">Company: <Select className="w-36 [&>select]:h-8" defaultValue="acme"><option value="acme">Acme Retail</option><option>City Mall</option><option>Fresh Bites</option></Select></div>}
        <span className="ml-auto text-[11px] text-slate-400">Showing media files for {ctx === "customer" ? "Acme Retail" : "Super Admin"}</span>
      </Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2"><SearchInput placeholder="Search media..." className="w-56" value={q} onChange={(e) => setQ(e.target.value)} /><FilterSelect label="All Types" /><FilterSelect label="All Statuses" /><span className="text-xs text-slate-400">{list.length} files</span></div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5"><button onClick={() => setView("grid")} className={cn("flex h-7 w-7 items-center justify-center rounded-md", view === "grid" ? "bg-blue-50 text-blue-600" : "text-slate-400")}><LayoutGrid className="h-3.5 w-3.5" /></button><button onClick={() => setView("list")} className={cn("flex h-7 w-7 items-center justify-center rounded-md", view === "list" ? "bg-blue-50 text-blue-600" : "text-slate-400")}><List className="h-3.5 w-3.5" /></button></div>
          <span className="text-[10px] text-slate-300">JPG, PNG, MP4 and PDF</span>
        </div>
      </div>

      <div className={cn(view === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-5" : "space-y-2")}>
        {list.map((m) => (
          <div key={m.id} className={cn("overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm", view === "list" && "flex items-center")}>
            <div className={cn("relative", view === "list" ? "w-40 shrink-0" : "")}>
              <Thumb m={m} />
              <Badge tone={m.type === "Image" ? "purple" : m.type === "Video" ? "blue" : "red"} className="absolute left-2 top-2">{m.type.toUpperCase()}</Badge>
            </div>
            <div className="flex-1 px-3.5 py-3">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/media/${m.id}`} className="truncate text-sm font-semibold text-slate-900 hover:text-blue-600">{m.name}</Link>
                <DropdownMenu items={[{ label: "Preview", icon: <Eye className="h-3.5 w-3.5" />, onSelect: () => setPreview(m) }, { label: "View Details", icon: <FileText className="h-3.5 w-3.5" />, href: `/media/${m.id}` }, { label: "Rename", icon: <Pencil className="h-3.5 w-3.5" />, onSelect: () => setRename(m) }, { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, tone: "danger", onSelect: () => setRemove(m) }]} />
              </div>
              <div className="mt-1 text-[11px] text-slate-400">{m.meta} · {m.size}</div>
              <div className="mt-2 flex items-center justify-between">
                <Badge tone={m.status === "Ready" ? "green" : m.status === "Processing" ? "blue" : "red"}>{m.status}</Badge>
                {m.status === "Failed" && <span className="flex gap-2 text-[11px] font-medium"><button className="flex items-center gap-1 text-blue-600 hover:underline"><RefreshCw className="h-3 w-3" />Retry</button><button onClick={() => setRemove(m)} className="text-red-600 hover:underline">Remove</button></span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <UploadMediaModal open={upload} onClose={() => setUpload(false)} />
      <PreviewMediaModal item={preview} onClose={() => setPreview(null)} />
      <RenameModal open={!!rename} onClose={() => setRename(null)} name={rename?.name ?? ""} />
      <RemoveMediaModal item={remove} onClose={() => setRemove(null)} failed={remove?.status === "Failed"} />
    </div>
  );
}
