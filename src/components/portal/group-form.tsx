"use client";
import { Button } from "@/components/ui/button";
import { DotStatus } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox, Input, Label } from "@/components/ui/input";
import { portalScreens, type PortalGroup } from "@/lib/portal-data";
import { cn, img } from "@/lib/utils";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLinkButton } from "./portal-stepper";

export function GroupForm({ group }: { group?: PortalGroup }) {
  const router = useRouter();
  const [name, setName] = useState(group?.name ?? "");
  const [desc, setDesc] = useState(group?.description ?? "");
  const [sel, setSel] = useState<string[]>(group?.screenIds ?? []);
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const members = portalScreens.filter((s) => sel.includes(s.id));

  return (
    <div className="space-y-4">
      <BackLinkButton label="Screen Groups" onClick={() => router.push("/portal/screens?tab=groups")} />
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-5">
          <Card>
            <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">{group ? group.name : "Create Group"}</div>
            <div className="space-y-4 px-5 py-4">
              <div><Label>Group Name</Label><Input placeholder="Lobby" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><Label>Description <span className="font-normal text-slate-400">(optional)</span></Label><Input placeholder="Brief description of this group" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
              <div>
                <Label>Member Screens</Label>
                <ul className="space-y-1.5">
                  {portalScreens.map((s) => {
                    const on = sel.includes(s.id);
                    return (
                      <li key={s.id}>
                        <div role="button" tabIndex={0} onClick={() => toggle(s.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle(s.id)} className={cn("flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors", on ? "border-blue-300 bg-blue-50/40" : "border-slate-200 hover:bg-slate-50")}>
                          <Checkbox checked={on} />
                          <span className="relative h-8 w-11 shrink-0 overflow-hidden rounded bg-slate-900"><img src={img(s.seed, 88, 64)} alt="" className="h-full w-full object-cover" /><span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1 text-[6px] text-white">{s.content}</span></span>
                          <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-900">{s.name}</span><span className="block truncate text-[10px] text-slate-400">{s.location}</span></span>
                          <DotStatus status={s.status} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button disabled={!name || sel.length === 0} onClick={() => router.push("/portal/screens?tab=groups")}>{group ? "Save Changes" : "Create Group"}</Button>
                {group && <Button variant="secondary" href={`/portal/screens/${group.screenIds[0]}/publish?group=${group.id}`}><Send className="h-3.5 w-3.5" /> Publish to Group</Button>}
              </div>
            </div>
          </Card>
        </div>
        {group && (
          <Card className="self-start">
            <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Member Status</div>
            <ul className="divide-y divide-slate-100">
              {members.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-5 py-2.5">
                  <span className="relative h-8 w-11 shrink-0 overflow-hidden rounded bg-slate-900"><img src={img(s.seed, 88, 64)} alt="" className="h-full w-full object-cover" /><span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1 text-[6px] text-white">{s.content}</span></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-900">{s.name}</span><span className="block text-[10px] text-slate-400">{group.content} · just now</span></span>
                  <DotStatus status={s.status} />
                </li>
              ))}
              {members.length === 0 && <li className="px-5 py-6 text-center text-xs text-slate-400">No screens selected.</li>}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
