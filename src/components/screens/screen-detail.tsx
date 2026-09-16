"use client";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, SectionLabel } from "@/components/ui/card";
import { Modal, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { Breadcrumb } from "@/components/ui/misc";
import { QueryState, Skeleton } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { useActivity } from "@/lib/api/hooks/activity";
import { useCompanyNames } from "@/lib/api/hooks/companies";
import { screenStatusLabel, useScreen, useScreenCommand, useUnpairScreen } from "@/lib/api/hooks/screens";
import { formatDate, formatDateTime, label, timeAgo } from "@/lib/format";
import { RefreshCw, RotateCcw, Send, Unlink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PublishModal } from "./publish-modal";

const KIND_LINK: Record<string, (id: string) => string> = { PLAYLIST: (id) => `/playlists/${id}/edit`, LAYOUT: (id) => `/layouts/use/${id}`, TEMPLATE_INSTANCE: () => "/layouts", CANVAS: (id) => `/screens/canvas/${id}` };

export function ScreenDetail({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const screen = useScreen(id);
  const { names } = useCompanyNames();
  const activity = useActivity({ search: screen.data?.name, resourceType: "screen", pageSize: 6 }, { enabled: !!screen.data });
  const command = useScreenCommand();
  const unpair = useUnpairScreen();
  const [publish, setPublish] = useState(false);
  const [confirmUnpair, setConfirmUnpair] = useState(false);

  const send = (cmd: "refresh" | "restart_player") => command.mutate({ id, command: cmd }, { onSuccess: () => toast.success(cmd === "refresh" ? "Refresh sent" : "Restart sent", "The player acts on it when online."), onError: (e) => toast.error(e) });
  const doUnpair = () => unpair.mutate(id, { onSuccess: () => { toast.success("Screen unpaired"); router.replace("/screens"); }, onError: (e) => toast.error(e) });

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: "All Screens", href: "/screens" }, { label: screen.data?.name ?? "…" }]} />
      <QueryState query={screen} skeleton={<div className="space-y-5"><Skeleton className="h-16" /><Skeleton className="h-80" /></div>}>
        {(s) => (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5"><h1 className="text-xl font-bold tracking-tight text-slate-900">{s.name}</h1><StatusBadge status={screenStatusLabel(s.status)} /></div>
                <p className="mt-1 text-xs text-slate-400">{names[s.companyId] ?? "—"} <span className="mx-1.5">·</span> {s.location ?? "No location"} <span className="mx-1.5">·</span> <span className="font-mono">{s.device?.deviceId ?? "—"}</span></p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => send("refresh")} disabled={command.isPending}><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
                <Button variant="secondary" onClick={() => send("restart_player")} disabled={command.isPending}><RotateCcw className="h-3.5 w-3.5" /> Restart Player</Button>
                <Button variant="danger-outline" onClick={() => setConfirmUnpair(true)}><Unlink className="h-3.5 w-3.5" /> Unpair</Button>
                <Button onClick={() => setPublish(true)}><Send className="h-3.5 w-3.5" /> Publish</Button>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
              <div className="space-y-5">
                <Card>
                  <CardHeader title="Current Display" action={<span className="text-[11px] text-slate-400">{label(s.orientation)} · {s.orientation === "LANDSCAPE" ? "16:9" : "9:16"}</span>} />
                  <div className="flex justify-center px-5 py-6">
                    <div className="w-full max-w-[560px] rounded-lg border-[6px] border-slate-900 bg-slate-900 shadow-2xl">
                      {s.assignment?.thumbnailUrl && s.status === "ONLINE" ? <img src={s.assignment.thumbnailUrl} alt="" className="aspect-video w-full rounded-[3px] object-cover" /> : <div className="flex aspect-video w-full items-center justify-center rounded-[3px] text-xs font-medium uppercase tracking-wider text-slate-500">{s.status !== "ONLINE" ? screenStatusLabel(s.status) : s.assignment ? "No preview available" : "Nothing assigned"}</div>}
                    </div>
                  </div>
                </Card>
                <Card>
                  <CardHeader title="Assigned Content" action={s.assignment && KIND_LINK[s.assignment.kind] ? <Button variant="secondary" size="sm" href={KIND_LINK[s.assignment.kind](s.assignment.refId)}>Open</Button> : undefined} />
                  {s.assignment ? (
                    <div className="flex items-center gap-4 px-5 py-4">
                      {s.assignment.thumbnailUrl ? <img src={s.assignment.thumbnailUrl} alt="" className="h-14 w-20 rounded-md object-cover" /> : <span className="h-14 w-20 rounded-md bg-slate-100" />}
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{s.assignment.name || label(s.assignment.kind)}</div>
                        <div className="text-[11px] text-slate-400">{label(s.assignment.kind)} · version {s.assignment.version}</div>
                        <div className="text-[11px] text-slate-400">Published {formatDateTime(s.assignment.publishedAt)}</div>
                        <StatusBadge status={label(s.syncState)} className="mt-1.5" />
                      </div>
                    </div>
                  ) : <div className="px-5 py-6 text-center text-xs text-slate-400">Nothing has been published to this screen yet.</div>}
                </Card>
                <Card>
                  <CardHeader title="Recent Activity" action={<Link href="/activity" className="text-xs font-medium text-blue-600 hover:underline">View All</Link>} />
                  <ul className="divide-y divide-slate-100">
                    {(activity.data?.data ?? []).map((a) => <li key={a.id} className="px-5 py-3"><div className="text-sm text-slate-800">{a.summary}</div><div className="text-[11px] text-slate-400">{formatDateTime(a.createdAt)}{a.actor ? ` · ${a.actor.name}` : ""}</div></li>)}
                    {activity.data && activity.data.data.length === 0 && <li className="px-5 py-6 text-center text-xs text-slate-400">No activity recorded for this screen.</li>}
                  </ul>
                </Card>
              </div>

              <div className="space-y-5">
                <Card className="px-5 py-4">
                  <SectionLabel>Health &amp; Status</SectionLabel>
                  <dl className="mt-3 space-y-4">
                    <div><dt className="text-[10px] uppercase tracking-wider text-slate-400">Status</dt><dd className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-slate-900"><span className={`h-2 w-2 rounded-full ${s.status === "ONLINE" ? "bg-green-500" : s.status === "OFFLINE" ? "bg-slate-400" : "bg-red-500"}`} />{screenStatusLabel(s.status)}</dd><div className="text-[11px] text-slate-400">Last seen {timeAgo(s.lastSeenAt)}</div></div>
                    <div><dt className="text-[10px] uppercase tracking-wider text-slate-400">Orientation</dt><dd className="mt-0.5 text-sm font-semibold text-slate-900">{label(s.orientation)}</dd><div className="text-[11px] text-slate-400">{s.device?.resolution ?? "Resolution unknown"}</div></div>
                    <div><dt className="text-[10px] uppercase tracking-wider text-slate-400">Sync</dt><dd className="mt-0.5 text-sm font-semibold text-slate-900">{label(s.syncState)}</dd><div className="text-[11px] text-slate-400">Manifest v{s.manifestVersion} · acknowledged v{s.ackVersion}</div></div>
                    <div><dt className="text-[10px] uppercase tracking-wider text-slate-400">Groups</dt><dd className="mt-0.5 text-sm font-semibold text-slate-900">{s.groups.map((g) => g.name).join(", ") || "None"}</dd></div>
                  </dl>
                </Card>
                <Card className="px-5 py-4">
                  <SectionLabel>Device Information</SectionLabel>
                  <dl className="mt-3 space-y-2.5 text-xs">
                    {[["Device ID", s.device?.deviceId, true], ["Player Version", s.device?.playerVersion], ["App Version", s.device?.appVersion], ["Model", s.device?.model], ["Firmware", s.device?.firmware], ["IP Address", s.device?.ip, true], ["Paired", formatDate(s.createdAt)]].map(([k, v, mono]) => (
                      <div key={String(k)} className="flex justify-between"><dt className="text-slate-400">{k}</dt><dd className={mono ? "font-mono font-semibold text-slate-800" : "font-semibold text-slate-800"}>{v || "—"}</dd></div>
                    ))}
                  </dl>
                </Card>
                <Card className="px-5 py-4">
                  <SectionLabel>Tags</SectionLabel>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {s.tags.length ? s.tags.map((t) => <Badge key={t} tone="slate">{t}</Badge>) : <span className="text-xs text-slate-400">No tags. Customers can add tags from their portal.</span>}
                  </div>
                </Card>
              </div>
            </div>

            <PublishModal open={publish} onClose={() => setPublish(false)} companyId={s.companyId} defaultScreen={s.id} />
          </>
        )}
      </QueryState>

      <Modal open={confirmUnpair} onClose={() => setConfirmUnpair(false)} width="max-w-md">
        <ModalHeader title="Unpair this screen?" subtitle="The device stops receiving content and the licence slot is released." onClose={() => setConfirmUnpair(false)} />
        <ModalFooter><Button variant="secondary" onClick={() => setConfirmUnpair(false)}>Cancel</Button><Button variant="danger" onClick={doUnpair} disabled={unpair.isPending}>{unpair.isPending ? "Unpairing…" : "Unpair Screen"}</Button></ModalFooter>
      </Modal>
    </div>
  );
}
