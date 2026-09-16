"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Label, SearchInput } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { DropdownMenu, Pagination } from "@/components/ui/misc";
import { EmptyState, QueryState } from "@/components/ui/query-state";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useCreatePlaylist, useDeletePlaylist, useDuplicatePlaylist, usePlaylists, useUpdatePlaylist } from "@/lib/api/hooks/playlists";
import type { Playlist } from "@/lib/api/types";
import { errorMessage, fmtClock, label, timeAgo } from "@/lib/format";
import { Copy, ListVideo, Monitor, Pencil, Plus, Trash2, Type } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Customer playlists list. `companyId` + `basePath` let the Super Admin reuse it per company. */
export function PlaylistsPage({ companyId, basePath = "/portal/playlists", query = "" }: { companyId?: string | null; basePath?: string; query?: string } = {}) {
  const router = useRouter();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [create, setCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [rename, setRename] = useState<Playlist | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [del, setDel] = useState<Playlist | null>(null);
  const [delError, setDelError] = useState("");
  const playlists = usePlaylists({ search: q || undefined, page }, { companyId });
  const createM = useCreatePlaylist(companyId);
  const updateM = useUpdatePlaylist(rename?.id ?? "", companyId);
  const duplicateM = useDuplicatePlaylist(companyId);
  const deleteM = useDeletePlaylist(companyId);
  const qs = query ? `?${query}` : "";
  const link = (p: Playlist, sub: string) => `${basePath}/${p.id}/${sub}${qs}`;

  const doCreate = () => createM.mutate({ name: newName.trim(), items: [] }, { onSuccess: (p) => { setCreate(false); setNewName(""); router.push(link(p, "edit")); }, onError: (e) => toast.error(e, "Couldn't create playlist") });
  const doRename = () => updateM.mutate({ name: renameVal.trim() }, { onSuccess: () => { toast.success("Playlist renamed"); setRename(null); }, onError: (e) => toast.error(e) });
  const doDuplicate = (p: Playlist) => duplicateM.mutate(p.id, { onSuccess: (c) => toast.success("Playlist duplicated", c.name), onError: (e) => toast.error(e) });
  const doDelete = () => del && deleteM.mutate(del.id, { onSuccess: () => { toast.success("Playlist deleted"); setDel(null); }, onError: (e) => setDelError(errorMessage(e)) });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><SearchInput placeholder="Search Playlists..." className="w-64" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /><Button onClick={() => setCreate(true)}><Plus className="h-4 w-4" /> Create Playlist</Button></div>
      <QueryState query={playlists} empty={<EmptyState icon={<ListVideo className="h-5 w-5" />} title={q ? "No playlists match" : "No playlists yet"} body="Playlists sequence media for your screens." action={<Button onClick={() => setCreate(true)}><Plus className="h-4 w-4" /> Create Playlist</Button>} />}>
        {({ data, meta }) => (
          <>
            <Card>
              <Table>
                <THead><tr><TH>Playlist</TH><TH className="text-center">Items</TH><TH>Duration</TH><TH>Status</TH><TH>Last updated</TH><TH> </TH></tr></THead>
                <tbody>
                  {data.map((p) => (
                    <TR key={p.id}>
                      <TD><Link href={link(p, "edit")} className="text-sm font-semibold text-slate-900 hover:text-blue-600">{p.name}</Link><div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">{p.assignedTo.length > 0 ? <><Monitor className="h-3 w-3" /> {p.assignedTo[0].name}{p.assignedTo.length > 1 && ` +${p.assignedTo.length - 1} more`}</> : "Not published"}</div></TD>
                      <TD className="text-center text-sm font-semibold text-slate-800">{p.itemCount}</TD>
                      <TD className="text-xs">{fmtClock(p.totalDurationSec)}</TD>
                      <TD><Badge tone={p.status === "PUBLISHED" ? "green" : "slate"} dot>{label(p.status)}</Badge></TD>
                      <TD className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(p.updatedAt)}</TD>
                      <TD className="text-right"><DropdownMenu items={[
                        { label: "Edit", icon: <Pencil className="h-3.5 w-3.5" />, href: link(p, "edit") },
                        { label: "Rename", icon: <Type className="h-3.5 w-3.5" />, onSelect: () => { setRename(p); setRenameVal(p.name); } },
                        { label: "Duplicate", icon: <Copy className="h-3.5 w-3.5" />, onSelect: () => doDuplicate(p) },
                        { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, tone: "danger", onSelect: () => { setDelError(""); setDel(p); } },
                      ]} /></TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            </Card>
            {meta && meta.totalPages > 1 && <Pagination page={meta.page} pages={meta.totalPages} onChange={setPage} summary={`${meta.total} playlists`} />}
          </>
        )}
      </QueryState>

      <Modal open={create} onClose={() => setCreate(false)} width="max-w-[420px]">
        <form onSubmit={(e) => { e.preventDefault(); doCreate(); }} className="p-6">
          <h2 className="text-base font-semibold text-slate-900">New Playlist</h2><p className="mt-0.5 text-xs text-slate-400">Give your playlist a name to get started.</p>
          <div className="mt-4"><Label>Playlist Name</Label><Input placeholder="e.g. Summer Campaign 2026" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus /></div>
          <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setCreate(false)}>Cancel</Button><Button type="submit" disabled={!newName.trim() || createM.isPending}><Plus className="h-3.5 w-3.5" /> {createM.isPending ? "Creating…" : "Create Playlist"}</Button></div>
        </form>
      </Modal>

      <Modal open={!!rename} onClose={() => setRename(null)} width="max-w-[380px]">
        <form onSubmit={(e) => { e.preventDefault(); doRename(); }} className="p-5">
          <h2 className="text-sm font-semibold text-slate-900">Rename Playlist</h2>
          <Input className="mt-3" value={renameVal} onChange={(e) => setRenameVal(e.target.value)} autoFocus />
          <div className="mt-4 flex justify-end gap-2"><Button type="button" size="sm" variant="secondary" onClick={() => setRename(null)}>Cancel</Button><Button type="submit" size="sm" disabled={!renameVal.trim() || updateM.isPending}>Rename</Button></div>
        </form>
      </Modal>

      <Modal open={!!del} onClose={() => setDel(null)} width="max-w-[400px]">
        {del && <div className="p-5"><h2 className="text-sm font-semibold text-slate-900">Delete Playlist</h2><p className="mt-2 text-xs leading-5 text-slate-500">Delete <span className="font-semibold text-slate-800">{del.name}</span>? {del.assignedTo.length > 0 ? `It is assigned to ${del.assignedTo.length} screen${del.assignedTo.length > 1 ? "s" : ""}; unassign it first.` : "This action cannot be undone."}</p>{delError && <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{delError}</p>}<div className="mt-4 flex justify-end gap-2"><Button size="sm" variant="secondary" onClick={() => setDel(null)}>Cancel</Button><Button size="sm" variant="danger" onClick={doDelete} disabled={deleteM.isPending}><Trash2 className="h-3.5 w-3.5" /> {deleteM.isPending ? "Deleting…" : "Delete"}</Button></div></div>}
      </Modal>
    </div>
  );
}
