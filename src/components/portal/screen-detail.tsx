"use client";
import { Button } from "@/components/ui/button";
import { Badge, DotStatus } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { portalGroups, portalPublishPlaylists, type PortalScreen } from "@/lib/portal-data";
import { img } from "@/lib/utils";
import { Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLinkButton } from "./portal-stepper";

export function ScreenDetail({ screen }: { screen: PortalScreen }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const current = portalPublishPlaylists.find((p) => p.name === screen.content) ?? portalPublishPlaylists[0];

  return (
    <div className="space-y-4">
      <BackLinkButton label="All Screens" onClick={() => router.push("/portal/screens")} />
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex flex-wrap gap-5">
              <div className="relative h-[100px] w-[176px] shrink-0 overflow-hidden rounded-lg bg-slate-900"><img src={img(screen.seed, 352, 200)} alt="" className="h-full w-full object-cover" /><span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2.5 pb-2 pt-6 text-white"><span className="block text-[11px] font-semibold">{screen.content}</span><span className="block text-[8px] text-white/70">Playlist</span></span></div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">{screen.name}</h1>
                <DotStatus status={screen.status} className="mt-1" />
                <div className="mt-1 text-xs text-slate-400">{screen.location}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" href={`/portal/screens/${screen.id}/publish`}><Send className="h-3.5 w-3.5" /> Publish Content</Button>
                  <Button size="sm" variant="secondary" onClick={() => setEditing((v) => !v)}>{editing ? "Cancel" : "Edit Screen"}</Button>
                </div>
              </div>
            </div>
          </Card>

          {editing && (
            <Card className="animate-fade-in">
              <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Edit Screen</div>
              <form onSubmit={(e) => { e.preventDefault(); setEditing(false); }} className="space-y-4 px-5 py-4">
                <div><Label>Screen Name</Label><Input defaultValue={screen.name} /></div>
                <div><Label>Location</Label><Input defaultValue={screen.location} /></div>
                <div><Label>Group</Label><Select defaultValue={screen.groupId ?? ""}><option value="">No group</option>{portalGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</Select></div>
                <div className="flex gap-2"><Button type="submit" size="sm">Save Changes</Button><Button type="button" size="sm" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button></div>
              </form>
            </Card>
          )}

          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3"><span className="text-sm font-semibold text-slate-900">Current Assignment</span><Link href={`/portal/screens/${screen.id}/publish`} className="text-xs font-medium text-blue-600 hover:underline">Change →</Link></div>
            <div className="flex items-center gap-3 px-5 py-4"><img src={img(current.seed, 96, 64)} alt="" className="h-8 w-12 rounded object-cover" /><div><div className="text-sm font-semibold text-slate-900">{screen.content}</div><div className="text-[11px] text-slate-400">{current.items} items · {current.duration}</div></div></div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Screen Info</div>
            <dl className="divide-y divide-slate-100 px-5 text-xs">
              <div className="flex justify-between py-2.5"><dt className="text-slate-400">Group</dt><dd className="font-semibold text-slate-800">{screen.group ?? "—"}</dd></div>
              <div className="flex justify-between py-2.5"><dt className="text-slate-400">Orientation</dt><dd className="font-semibold text-slate-800">{screen.orientation}</dd></div>
              <div className="flex justify-between py-2.5"><dt className="text-slate-400">Last Sync</dt><dd className="font-semibold text-slate-800">{screen.lastSync}</dd></div>
              <div className="flex items-center justify-between gap-3 py-2.5"><dt className="text-slate-400">Tags</dt><dd className="flex flex-wrap justify-end gap-1">{screen.tags.map((t) => <Badge key={t} tone="blue">{t}</Badge>)}</dd></div>
            </dl>
          </Card>
          <Card>
            <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Device Info</div>
            <dl className="divide-y divide-slate-100 px-5 text-xs">
              {[["Device", screen.device], ["Resolution", screen.resolution], ["Firmware", screen.firmware]].map(([k, v]) => <div key={k} className="flex justify-between py-2.5"><dt className="text-slate-400">{k}</dt><dd className="font-semibold text-slate-800">{v}</dd></div>)}
              <div className="flex justify-between py-2.5"><dt className="text-slate-400">IP Address</dt><dd className="font-mono text-[11px] font-semibold text-slate-800">{screen.ip}</dd></div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
