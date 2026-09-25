"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { applyApiError, Field, fieldError, FormError, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Input, SearchInput } from "@/components/ui/input";
import { PLAYLIST_NAME_MAX, playlistNameSchema } from "@/components/playlists/playlist-schema";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { maskName } from "@/lib/validation/masks";
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
  const search = useDebouncedValue(q.trim(), 300);
  const [create, setCreate] = useState(false);
  const [rename, setRename] = useState<Playlist | null>(null);
  const [del, setDel] = useState<Playlist | null>(null);
  const [delError, setDelError] = useState("");
  const createForm = useZodForm(playlistNameSchema, { defaultValues: { name: "" } });
  const renameForm = useZodForm(playlistNameSchema, { defaultValues: { name: "" } });
  const playlists = usePlaylists({ search: search || undefined, page }, { companyId });
  const createM = useCreatePlaylist(companyId);
  const updateM = useUpdatePlaylist(rename?.id ?? "", companyId);
  const duplicateM = useDuplicatePlaylist(companyId);
  const deleteM = useDeletePlaylist(companyId);
  const qs = query ? `?${query}` : "";
  const link = (p: Playlist, sub: string) => `${basePath}/${p.id}/${sub}${qs}`;

  const openCreate = () => { createForm.reset({ name: "" }); setCreate(true); };
  const closeCreate = () => { if (!createForm.formState.isSubmitting) setCreate(false); };
  const openRename = (p: Playlist) => { renameForm.reset({ name: p.name }); setRename(p); };
  const closeRename = () => { if (!renameForm.formState.isSubmitting) setRename(null); };
  const doCreate = createForm.handleSubmit(async (v) => {
    try {
      const p = await createM.mutateAsync({ name: v.name, items: [] });
      setCreate(false);
      router.push(link(p, "edit"));
    } catch (e) { applyApiError(createForm, e); }
  });
  const doRename = renameForm.handleSubmit(async (v) => {
    if (!rename) return;
    if (v.name === rename.name) { setRename(null); return; }
    try {
      await updateM.mutateAsync({ name: v.name });
      toast.success("Playlist renamed");
      setRename(null);
    } catch (e) { applyApiError(renameForm, e); }
  });
  const doDuplicate = (p: Playlist) => !duplicateM.isPending && duplicateM.mutate(p.id, { onSuccess: (c) => toast.success("Playlist duplicated", c.name), onError: (e) => toast.error(e) });
  const doDelete = () => del && !deleteM.isPending && deleteM.mutate(del.id, { onSuccess: () => { toast.success("Playlist deleted"); setDel(null); }, onError: (e) => setDelError(errorMessage(e)) });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><SearchInput placeholder="Search Playlists..." className="w-64" maxLength={120} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /><Button onClick={openCreate}><Plus className="h-4 w-4" /> Create Playlist</Button></div>
      <QueryState query={playlists} empty={<EmptyState icon={<ListVideo className="h-5 w-5" />} title={search ? "No playlists match" : "No playlists yet"} body="Playlists sequence media for your screens." action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Create Playlist</Button>} />}>
        {({ data, meta }) => (
          <>
            <Card>
              <Table>
                <THead><tr><TH>Playlist</TH><TH className="text-center">Items</TH><TH>Duration</TH><TH>Status</TH><TH>Last updated</TH><TH> </TH></tr></THead>
                <tbody>
                  {data.map((p) => (
                    <TR key={p.id}>
                      <TD><Link href={link(p, "edit")} className="text-sm font-semibold text-slate-900 hover:text-blue-600">{p.name}</Link><div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">{(p.assignedTo ?? []).length > 0 ? <><Monitor className="h-3 w-3" /> {p.assignedTo[0].name}{p.assignedTo.length > 1 && ` +${p.assignedTo.length - 1} more`}</> : "Not published"}</div></TD>
                      <TD className="text-center text-sm font-semibold text-slate-800">{p.itemCount}</TD>
                      <TD className="text-xs">{fmtClock(p.totalDurationSec)}</TD>
                      <TD><Badge tone={p.status === "PUBLISHED" ? "green" : "slate"} dot>{label(p.status)}</Badge></TD>
                      <TD className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(p.updatedAt)}</TD>
                      <TD className="text-right"><DropdownMenu items={[
                        { label: "Edit", icon: <Pencil className="h-3.5 w-3.5" />, href: link(p, "edit") },
                        { label: "Rename", icon: <Type className="h-3.5 w-3.5" />, onSelect: () => openRename(p) },
                        { label: duplicateM.isPending && duplicateM.variables === p.id ? "Duplicating…" : "Duplicate", icon: <Copy className="h-3.5 w-3.5" />, onSelect: () => doDuplicate(p), disabled: duplicateM.isPending },
                        { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, tone: "danger", onSelect: () => { setDelError(""); setDel(p); }, disabled: deleteM.isPending },
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

      <Modal open={create} onClose={closeCreate} width="max-w-[420px]">
        <form onSubmit={doCreate} noValidate className="p-6">
          <h2 className="text-base font-semibold text-slate-900">New Playlist</h2><p className="mt-0.5 text-xs text-slate-400">Give your playlist a name to get started.</p>
          <FormError form={createForm} className="mt-3" />
          <Field label="Playlist Name" required className="mt-4" error={fieldError(createForm, "name")}><Input placeholder="e.g. Summer Campaign 2026" maxLength={PLAYLIST_NAME_MAX} autoFocus {...maskedRegister(createForm, "name", maskName)} /></Field>
          <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={closeCreate} disabled={createForm.formState.isSubmitting}>Cancel</Button><SubmitButton form={createForm} pendingText="Creating…"><Plus className="h-3.5 w-3.5" /> Create Playlist</SubmitButton></div>
        </form>
      </Modal>

      <Modal open={!!rename} onClose={closeRename} width="max-w-[380px]">
        <form onSubmit={doRename} noValidate className="p-5">
          <h2 className="text-sm font-semibold text-slate-900">Rename Playlist</h2>
          <FormError form={renameForm} className="mt-3" />
          <Field label="Playlist Name" required className="mt-3" error={fieldError(renameForm, "name")}><Input maxLength={PLAYLIST_NAME_MAX} autoFocus {...maskedRegister(renameForm, "name", maskName)} /></Field>
          <div className="mt-4 flex justify-end gap-2"><Button type="button" size="sm" variant="secondary" onClick={closeRename} disabled={renameForm.formState.isSubmitting}>Cancel</Button><SubmitButton form={renameForm} size="sm">Rename</SubmitButton></div>
        </form>
      </Modal>

      <Modal open={!!del} onClose={() => !deleteM.isPending && setDel(null)} width="max-w-[400px]">
        {del && <div className="p-5"><h2 className="text-sm font-semibold text-slate-900">Delete Playlist</h2><p className="mt-2 text-xs leading-5 text-slate-500">Delete <span className="font-semibold text-slate-800">{del.name}</span>? {(del.assignedTo ?? []).length > 0 ? `It is assigned to ${del.assignedTo.length} screen${del.assignedTo.length > 1 ? "s" : ""}; unassign it first.` : "This action cannot be undone."}</p>{delError && <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{delError}</p>}<div className="mt-4 flex justify-end gap-2"><Button size="sm" variant="secondary" onClick={() => setDel(null)} disabled={deleteM.isPending}>Cancel</Button><Button size="sm" variant="danger" onClick={doDelete} disabled={deleteM.isPending}><Trash2 className="h-3.5 w-3.5" /> {deleteM.isPending ? "Deleting…" : "Delete"}</Button></div></div>}
      </Modal>
    </div>
  );
}
