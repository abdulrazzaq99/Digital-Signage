"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SuccessIcon } from "@/components/ui/misc";
import { portalGroups, portalPublishPlaylists, type PortalScreen } from "@/lib/portal-data";
import { img } from "@/lib/utils";
import { ChevronRight, Monitor, Send } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BackLinkButton, PortalStepper } from "./portal-stepper";

export function ScreenPublish({ screen }: { screen: PortalScreen }) {
  const router = useRouter();
  const sp = useSearchParams();
  const group = portalGroups.find((g) => g.id === sp.get("group"));
  const target = group ? { name: group.name, sub: `${group.screenIds.length} screens` } : { name: screen.name, sub: screen.location };
  const [step, setStep] = useState(1);
  const [pick, setPick] = useState(portalPublishPlaylists[0]);
  const back = group ? "/portal/screens?tab=groups" : `/portal/screens/${screen.id}`;

  return (
    <div className="space-y-5">
      <BackLinkButton label="Back" onClick={() => (step === 1 ? router.push(back) : setStep(step - 1))} />
      <PortalStepper steps={["Content", "Review", "Done"]} current={step} className="max-w-md" />

      {step === 1 && (
        <Card className="max-w-[560px] animate-fade-in">
          <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Choose Playlist</div>
          <div className="space-y-3 px-5 py-4">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600"><Monitor className="h-3.5 w-3.5 text-slate-400" /> Publishing to: <span className="font-semibold text-slate-800">{target.name}</span></div>
            <ul className="space-y-1.5">
              {portalPublishPlaylists.map((p) => (
                <li key={p.id}><button onClick={() => { setPick(p); setStep(2); }} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40"><img src={img(p.seed, 96, 64)} alt="" className="h-8 w-12 rounded object-cover" /><span className="flex-1"><span className="block text-sm font-semibold text-slate-900">{p.name}</span><span className="block text-[11px] text-slate-400">{p.items} items · {p.duration}</span></span><ChevronRight className="h-4 w-4 text-slate-300" /></button></li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="max-w-[560px] animate-fade-in">
          <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Review &amp; Publish</div>
          <div className="space-y-4 px-5 py-4">
            <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-slate-50/60 px-4 text-xs">
              <div className="flex justify-between gap-6 py-3"><dt className="text-slate-400">Destination</dt><dd className="text-right"><span className="block font-semibold text-slate-900">{target.name}</span><span className="block text-[10px] text-slate-400">{target.sub}</span></dd></div>
              <div className="flex justify-between gap-6 py-3"><dt className="text-slate-400">Playlist</dt><dd className="text-right"><span className="block font-semibold text-slate-900">{pick.name}</span><span className="block text-[10px] text-slate-400">{pick.items} items · {pick.duration}</span></dd></div>
              <div className="flex justify-between gap-6 py-3"><dt className="text-slate-400">Action</dt><dd className="font-semibold text-slate-900">Publish immediately</dd></div>
            </dl>
            <div className="flex gap-2"><Button variant="secondary" onClick={() => setStep(1)}>← Back</Button><Button className="flex-1" onClick={() => setStep(3)}><Send className="h-3.5 w-3.5" /> Publish Now</Button></div>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="flex max-w-[560px] flex-col items-center px-6 py-10 text-center animate-fade-in">
          <SuccessIcon />
          <h2 className="mt-4 text-base font-semibold text-slate-900">Published &amp; Synced</h2>
          <p className="mt-1 text-xs text-slate-500"><span className="font-semibold text-slate-800">{pick.name}</span> is now live on <span className="font-semibold text-slate-800">{target.name}</span>.</p>
          <Button className="mt-5" onClick={() => router.push(back)}>Done</Button>
        </Card>
      )}
    </div>
  );
}
