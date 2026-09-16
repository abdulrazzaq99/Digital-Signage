"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Label, SearchInput } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { DropdownMenu } from "@/components/ui/misc";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { fmtClock, portalPlaylists, type PortalPlaylist } from "@/lib/portal-data";
import { Copy, Monitor, Pencil, Plus, Trash2, Type } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PlaylistsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PortalPlaylist[]>(portalPlaylists);
  const [q, setQ] = useState("");
  const [create, setCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [rename, setRename] = useState<PortalPlaylist | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [del, setDel] = useState<PortalPlaylist | null>(null);
  const list = rows.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  const total = (p: PortalPlaylist) => p.items.reduce((a, b) => a + b.duration, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><SearchInput placeholder="Search Playlists..." className="w-64" value={q} onChange={(e) => setQ(e.target.value)} /><Button onClick={() => setCreate(true)}><Plus className="h-4 w-4" /> Create Playlist</Button></div>
      <Card>
        <Table>
          <THead><tr><TH>Playlist</TH><TH className="text-center">Items</TH><TH>Duration</TH><TH>Status</TH><TH>Last updated</TH><TH> </TH></tr></THead>
          <tbody>
            {list.map((p) => (
              <TR key={p.id}>
                <TD><Link href={`/portal/playlists/${p.id}/edit`} className="text-sm font-semibold text-slate-900 hover:text-blue-600">{p.name}</Link><div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">{p.assignedTo.length > 0 ? <><Monitor className="h-3 w-3" /> {p.assignedTo[0]}{p.assignedTo.length > 1 && ` +${p.assignedTo.length - 1} more`}</> : "Not published"}</div></TD>
                <TD className="text-center text-sm font-semibold text-slate-800">{p.items.length}</TD>
                <TD className="text-xs">{fmtClock(total(p))}</TD>
                <TD><Badge tone={p.status === "Published" ? "green" : "slate"} dot>{p.status}</Badge></TD>
                <TD className="text-xs text-slate-400 whitespace-nowrap">{p.updated}</TD>
                <TD className="text-right"><DropdownMenu items={[
                  { label: "Edit", icon: <Pencil className="h-3.5 w-3.5" />, href: `/portal/playlists/${p.id}/edit` },
                  { label: "Rename", icon: <Type className="h-3.5 w-3.5" />, onSelect: () => { setRename(p); setRenameVal(p.name); } },
                  { label: "Duplicate", icon: <Copy className="h-3.5 w-3.5" />, onSelect: () => setRows((r) => { const i = r.findIndex((x) => x.id === p.id); const copy: PortalPlaylist = { ...p, id: `${p.id}-copy-${Date.now()}`, name: `${p.name} (copy)`, status: "Draft", assignedTo: [], updated: "Just now" }; return [...r.slice(0, i + 1), copy, ...r.slice(i + 1)]; }) },
                  { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, tone: "danger", onSelect: () => setDel(p) },
                ]} /></TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal open={create} onClose={() => setCreate(false)} width="max-w-[420px]">
        <form onSubmit={(e) => { e.preventDefault(); const slug = newName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "new-playlist"; setRows((r) => [...r, { id: slug, name: newName.trim(), items: [], status: "Draft", assignedTo: [], updated: "Just now" }]); setCreate(false); router.push(`/portal/playlists/${slug}/edit`); }} className="p-6">
          <h2 className="text-base font-semibold text-slate-900">New Playlist</h2><p className="mt-0.5 text-xs text-slate-400">Give your playlist a name to get started.</p>
          <div className="mt-4"><Label>Playlist Name</Label><Input placeholder="e.g. Summer Campaign 2026" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus /></div>
          <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setCreate(false)}>Cancel</Button><Button type="submit" disabled={!newName.trim()}><Plus className="h-3.5 w-3.5" /> Create Playlist</Button></div>
        </form>
      </Modal>

      <Modal open={!!rename} onClose={() => setRename(null)} width="max-w-[380px]">
        <form onSubmit={(e) => { e.preventDefault(); setRows((r) => r.map((x) => (x.id === rename?.id ? { ...x, name: renameVal } : x))); setRename(null); }} className="p-5">
          <h2 className="text-sm font-semibold text-slate-900">Rename Playlist</h2>
          <Input className="mt-3" value={renameVal} onChange={(e) => setRenameVal(e.target.value)} autoFocus />
          <div className="mt-4 flex justify-end gap-2"><Button type="button" size="sm" variant="secondary" onClick={() => setRename(null)}>Cancel</Button><Button type="submit" size="sm">Rename</Button></div>
        </form>
      </Modal>

      <Modal open={!!del} onClose={() => setDel(null)} width="max-w-[400px]">
        {del && <div className="p-5"><h2 className="text-sm font-semibold text-slate-900">Delete Playlist</h2><p className="mt-2 text-xs leading-5 text-slate-500">Are you sure you want to delete <span className="font-semibold text-slate-800">{del.name}</span>? This will remove it from all assigned screens. This action cannot be undone.</p><div className="mt-4 flex justify-end gap-2"><Button size="sm" variant="secondary" onClick={() => setDel(null)}>Cancel</Button><Button size="sm" variant="danger" onClick={() => { setRows((r) => r.filter((x) => x.id !== del.id)); setDel(null); }}><Trash2 className="h-3.5 w-3.5" /> Delete</Button></div></div>}
      </Modal>
    </div>
  );
}
