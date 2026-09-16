"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, StatCard } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/input";
import { DropdownMenu } from "@/components/ui/misc";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { portalMedia, type PortalMedia } from "@/lib/portal-data";
import { cn } from "@/lib/utils";
import { Eye, LayoutGrid, List, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { MediaDrawer, MediaPreview, statusTone, typeTone, type MediaDrawerView } from "./media-drawer";
import { PortalUploadModal } from "./upload-media-modal";

type Filter = "All" | "Images" | "Videos" | "PDFs";
const matches = (m: PortalMedia, f: Filter) => f === "All" || (f === "Images" ? m.type === "JPG/PNG" : f === "Videos" ? m.type === "MP4" : m.type === "PDF");

export function MediaPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState("");
  const [upload, setUpload] = useState(false);
  const [drawer, setDrawer] = useState<{ item: PortalMedia; view: MediaDrawerView } | null>(null);
  const list = portalMedia.filter((m) => matches(m, filter) && m.name.toLowerCase().includes(q.toLowerCase()));
  const count = (f: Filter) => portalMedia.filter((m) => matches(m, f)).length;
  const open = (item: PortalMedia, v: MediaDrawerView = "detail") => setDrawer({ item, view: v });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput placeholder="Search media..." className="w-56" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="flex flex-wrap gap-1.5">{(["All", "Images", "Videos", "PDFs"] as Filter[]).map((f) => <button key={f} onClick={() => setFilter(f)} className={cn("flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors", filter === f ? "border-blue-200 bg-blue-50 text-blue-600" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{f}<span className={cn("rounded px-1 text-[10px]", filter === f ? "bg-white text-blue-600" : "bg-slate-100 text-slate-400")}>{count(f)}</span></button>)}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5"><button onClick={() => setView("grid")} className={cn("flex h-7 w-7 items-center justify-center rounded-md", view === "grid" ? "bg-blue-50 text-blue-600" : "text-slate-400")}><LayoutGrid className="h-3.5 w-3.5" /></button><button onClick={() => setView("list")} className={cn("flex h-7 w-7 items-center justify-center rounded-md", view === "list" ? "bg-blue-50 text-blue-600" : "text-slate-400")}><List className="h-3.5 w-3.5" /></button></div>
          <Button onClick={() => setUpload(true)}><Upload className="h-4 w-4" /> Upload Media</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={portalMedia.length} label="Total Files" tone="blue" />
        <StatCard value={portalMedia.filter((m) => m.status === "Ready").length} label="Ready" tone="green" />
        <StatCard value={portalMedia.filter((m) => m.status === "Processing").length} label="Processing" tone="amber" />
        <StatCard value={portalMedia.filter((m) => m.status === "Failed").length} label="Failed" tone="red" />
      </div>

      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {list.map((m) => (
            <div key={m.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <button onClick={() => open(m)} className="relative block w-full text-left">
                {m.status === "Processing" ? <div className="flex aspect-video items-center justify-center bg-slate-800"><span className="absolute left-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-700">● Processing</span><MediaPreview item={m} className="h-full w-full opacity-40" /></div>
                  : m.status === "Failed" ? <div className="relative flex aspect-video items-center justify-center bg-orange-50"><span className="absolute left-2 top-2 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-semibold text-red-600">● Failed</span><MediaPreview item={m} className="h-full w-full" /></div>
                  : <MediaPreview item={m} className="aspect-video" />}
              </button>
              <div className="flex items-start justify-between gap-2 px-3 py-2.5">
                <div className="min-w-0"><button onClick={() => open(m)} className="block max-w-full truncate text-xs font-semibold text-slate-900 hover:text-blue-600">{m.name}</button><div className="mt-1 flex items-center gap-1.5"><Badge tone={typeTone(m.type)}>{m.type}</Badge><span className="text-[10px] text-slate-400">{m.size}</span></div></div>
                <DropdownMenu items={[{ label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, onSelect: () => open(m) }, { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, tone: "danger", onSelect: () => open(m, "delete") }]} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <THead><tr><TH>Preview</TH><TH>Name</TH><TH>Type</TH><TH>Status</TH><TH>Size</TH><TH>Used In</TH><TH> </TH></tr></THead>
            <tbody>
              {list.map((m) => (
                <TR key={m.id} className="cursor-pointer" onClick={() => open(m)}>
                  <TD><MediaPreview item={m} className="h-8 w-12 overflow-hidden rounded" /></TD>
                  <TD><div className="text-sm font-semibold text-slate-900 whitespace-nowrap">{m.name}</div><div className="text-[11px] text-slate-400 whitespace-nowrap">{m.uploaded}</div></TD>
                  <TD><Badge tone={typeTone(m.type)}>{m.type}</Badge></TD>
                  <TD><Badge tone={statusTone(m.status)} dot>{m.status}</Badge></TD>
                  <TD className="text-xs whitespace-nowrap">{m.size}</TD>
                  <TD className="text-xs text-slate-500 whitespace-nowrap">{m.usedIn.length ? `${m.usedIn.length} playlist${m.usedIn.length > 1 ? "s" : ""}` : <span className="text-slate-300">Unused</span>}</TD>
                  <TD onClick={(e) => e.stopPropagation()}><DropdownMenu items={[{ label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, onSelect: () => open(m) }, { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, tone: "danger", onSelect: () => open(m, "delete") }]} /></TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <PortalUploadModal open={upload} onClose={() => setUpload(false)} />
      <MediaDrawer item={drawer?.item ?? null} initialView={drawer?.view ?? "detail"} onClose={() => setDrawer(null)} />
    </div>
  );
}
