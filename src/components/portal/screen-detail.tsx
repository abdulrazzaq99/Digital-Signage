"use client";
import { Button } from "@/components/ui/button";
import { Badge, DotStatus } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Modal, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { QueryState, Skeleton } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { useGroups } from "@/lib/api/hooks/groups";
import { screenStatusLabel, useScreen, useScreenCommand, useUnpairScreen, useUpdateScreen } from "@/lib/api/hooks/screens";
import type { Screen } from "@/lib/api/types";
import { formatDateTime, label, timeAgo } from "@/lib/format";
import { RefreshCw, Send, Unplug } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLinkButton } from "./portal-stepper";
import { ScreenThumb } from "./screens-page";

const ASSIGNMENT_KIND: Record<string, string> = { PLAYLIST: "Playlist", LAYOUT: "Layout", TEMPLATE_INSTANCE: "Template", CANVAS: "Synchronized canvas" };

function EditForm({ screen, companyId, onDone }: { screen: Screen; companyId?: string | null; onDone: () => void }) {
  const groups = useGroups({ companyId });
  const update = useUpdateScreen(screen.id, companyId);
  const toast = useToast();
  const [form, setForm] = useState({ name: screen.name, location: screen.location ?? "", groupId: screen.groups[0]?.id ?? "", orientation: screen.orientation, tags: screen.tags.join(", ") });
  const save = async () => {
    try {
      await update.mutateAsync({ name: form.name.trim(), location: form.location.trim(), orientation: form.orientation, groupId: form.groupId, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) });
      toast.success("Screen updated");
      onDone();
    } catch (e) { toast.error(e, "Couldn't save screen"); }
  };
  return (
    <Card className="animate-fade-in">
      <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Edit Screen</div>
      <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4 px-5 py-4">
        <div><Label required>Screen Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} /></div>
        <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
        <div><Label>Group</Label><Select value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })}><option value="">No group</option>{groups.data?.data.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</Select></div>
        <div><Label>Orientation</Label><Select value={form.orientation} onChange={(e) => setForm({ ...form, orientation: e.target.value as Screen["orientation"] })}><option value="LANDSCAPE">Landscape (16:9)</option><option value="PORTRAIT">Portrait (9:16)</option></Select></div>
        <div><Label>Tags</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="lobby, customer-facing" /></div>
        <div className="flex gap-2"><Button type="submit" size="sm" disabled={update.isPending}>{update.isPending ? "Saving…" : "Save Changes"}</Button><Button type="button" size="sm" variant="secondary" onClick={onDone}>Cancel</Button></div>
      </form>
    </Card>
  );
}

export function ScreenDetail({ id, companyId, basePath = "/portal/screens" }: { id: string; companyId?: string | null; basePath?: string }) {
  const router = useRouter();
  const toast = useToast();
  const screen = useScreen(id, { companyId });
  const command = useScreenCommand(companyId);
  const unpair = useUnpairScreen(companyId);
  const [editing, setEditing] = useState(false);
  const [confirmUnpair, setConfirmUnpair] = useState(false);

  const send = (cmd: "refresh" | "restart_player") => command.mutate({ id, command: cmd }, { onSuccess: () => toast.success(cmd === "refresh" ? "Refresh sent" : "Restart sent", "The player will act on it when it is online."), onError: (e) => toast.error(e) });
  const doUnpair = () => unpair.mutate(id, { onSuccess: () => { toast.success("Screen unpaired", "The licence slot has been released."); router.replace(basePath); }, onError: (e) => toast.error(e) });

  return (
    <div className="space-y-4">
      <BackLinkButton label="All Screens" onClick={() => router.push(basePath)} />
      <QueryState query={screen} skeleton={<div className="grid gap-5 xl:grid-cols-[1fr_320px]"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>}>
        {(s) => (
          <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <Card className="p-5">
                <div className="flex flex-wrap gap-5">
                  <ScreenThumb screen={s} className="h-[100px] w-[176px] rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">{s.name}</h1>
                    <DotStatus status={screenStatusLabel(s.status)} className="mt-1" />
                    <div className="mt-1 text-xs text-slate-400">{s.location ?? "No location set"}</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" href={`${basePath}/${s.id}/publish`}><Send className="h-3.5 w-3.5" /> Publish Content</Button>
                      <Button size="sm" variant="secondary" onClick={() => setEditing((v) => !v)}>{editing ? "Cancel" : "Edit Screen"}</Button>
                      <Button size="sm" variant="secondary" onClick={() => send("refresh")} disabled={command.isPending}><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
                      <Button size="sm" variant="danger-outline" onClick={() => setConfirmUnpair(true)}><Unplug className="h-3.5 w-3.5" /> Unpair</Button>
                    </div>
                  </div>
                </div>
              </Card>

              {editing && <EditForm screen={s} companyId={companyId} onDone={() => setEditing(false)} />}

              <Card>
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3"><span className="text-sm font-semibold text-slate-900">Current Assignment</span><Link href={`${basePath}/${s.id}/publish`} className="text-xs font-medium text-blue-600 hover:underline">Change →</Link></div>
                {s.assignment ? (
                  <div className="flex items-center gap-3 px-5 py-4">
                    {s.assignment.thumbnailUrl ? <img src={s.assignment.thumbnailUrl} alt="" className="h-8 w-12 rounded object-cover" /> : <span className="h-8 w-12 rounded bg-slate-100" />}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-900">{s.assignment.name || label(s.assignment.kind)}</div>
                      <div className="text-[11px] text-slate-400">{ASSIGNMENT_KIND[s.assignment.kind] ?? label(s.assignment.kind)} · v{s.assignment.version} · published {formatDateTime(s.assignment.publishedAt)}</div>
                    </div>
                    <Badge tone={s.syncState === "SYNCED" ? "green" : s.syncState === "FAILED" ? "red" : "amber"} dot>{label(s.syncState)}</Badge>
                  </div>
                ) : (
                  <div className="px-5 py-6 text-center text-xs text-slate-400">Nothing published to this screen yet.</div>
                )}
              </Card>
            </div>

            <div className="space-y-5">
              <Card>
                <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Screen Info</div>
                <dl className="divide-y divide-slate-100 px-5 text-xs">
                  <div className="flex justify-between py-2.5"><dt className="text-slate-400">Group</dt><dd className="font-semibold text-slate-800">{s.groups.map((g) => g.name).join(", ") || "—"}</dd></div>
                  <div className="flex justify-between py-2.5"><dt className="text-slate-400">Orientation</dt><dd className="font-semibold text-slate-800">{label(s.orientation)}</dd></div>
                  <div className="flex justify-between py-2.5"><dt className="text-slate-400">Last Seen</dt><dd className="font-semibold text-slate-800">{timeAgo(s.lastSeenAt)}</dd></div>
                  <div className="flex justify-between py-2.5"><dt className="text-slate-400">Manifest</dt><dd className="font-semibold text-slate-800">v{s.manifestVersion} <span className="font-normal text-slate-400">(ack v{s.ackVersion})</span></dd></div>
                  <div className="flex items-center justify-between gap-3 py-2.5"><dt className="text-slate-400">Tags</dt><dd className="flex flex-wrap justify-end gap-1">{s.tags.length ? s.tags.map((t) => <Badge key={t} tone="blue">{t}</Badge>) : <span className="text-slate-400">—</span>}</dd></div>
                </dl>
              </Card>
              <Card>
                <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Device Info</div>
                <dl className="divide-y divide-slate-100 px-5 text-xs">
                  {[["Device", s.device?.model], ["Player", s.device?.playerVersion], ["Resolution", s.device?.resolution], ["Firmware", s.device?.firmware]].map(([k, v]) => <div key={k} className="flex justify-between py-2.5"><dt className="text-slate-400">{k}</dt><dd className="font-semibold text-slate-800">{v || "—"}</dd></div>)}
                  <div className="flex justify-between py-2.5"><dt className="text-slate-400">IP Address</dt><dd className="font-mono text-[11px] font-semibold text-slate-800">{s.device?.ip || "—"}</dd></div>
                </dl>
                <div className="border-t border-slate-100 px-5 py-3"><Button size="sm" variant="secondary" className="w-full" onClick={() => send("restart_player")} disabled={command.isPending}>Restart Player</Button></div>
              </Card>
            </div>
          </div>
        )}
      </QueryState>

      <Modal open={confirmUnpair} onClose={() => setConfirmUnpair(false)} width="max-w-md">
        <ModalHeader title="Unpair this screen?" subtitle="The device will stop receiving content and the licence slot is released. You can pair it again later." onClose={() => setConfirmUnpair(false)} />
        <ModalFooter>
          <Button variant="secondary" onClick={() => setConfirmUnpair(false)}>Cancel</Button>
          <Button variant="danger" onClick={doUnpair} disabled={unpair.isPending}>{unpair.isPending ? "Unpairing…" : "Unpair Screen"}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
