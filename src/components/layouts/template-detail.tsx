import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Alert, BackLink } from "@/components/ui/misc";
import type { Template } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Check, Copy, ImageIcon, LayoutTemplate, Lock, Palette, Pencil, Shield, Trash2, Type } from "lucide-react";
import { TemplateArt } from "./template-art";

export function TemplateDetail({ t }: { t: Template }) {
  return (
    <div className="space-y-5">
      <BackLink href="/layouts" label="Back to Templates" current={t.name} />
      <div className="grid gap-6 xl:grid-cols-[1fr_460px]">
        <div>
          <div className={cn("relative rounded-xl border-[6px] border-slate-900 bg-slate-900 shadow-2xl", t.orientation === "Portrait" && "mx-auto max-w-[360px]")}>
            <span className="absolute right-3 top-3 z-10 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">{t.fields.length} editable fields</span>
            <span className="absolute left-3 top-2 z-10 text-[9px] text-white/50">{t.ratio} PREVIEW</span>
            <TemplateArt t={t} className="rounded-md text-xl" />
          </div>
          <div className="mt-3 flex gap-2">{[`${t.orientation === "Portrait" ? "1080 × 1920" : "1920 × 1080"} px`, t.orientation, t.ratio].map((x) => <Badge key={x} tone="slate">{x}</Badge>)}</div>
        </div>
        <div className="space-y-4">
          <div><h1 className="text-xl font-bold tracking-tight text-slate-900">{t.name}</h1><div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400"><Badge tone="purple">{t.category}</Badge>Updated {t.updated} · Used in {t.usedIn} playlists</div></div>
          <div className="grid grid-cols-3 gap-2">{[["Created", t.created], ["Last Updated", t.updated], ["Used In", `${t.usedIn} playlists`]].map(([k, v]) => <Card key={k} className="px-3 py-2"><div className="text-[10px] text-slate-400">{k}</div><div className="text-xs font-semibold text-slate-900">{v}</div></Card>)}</div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">Editable Fields <Badge tone="green">{t.fields.length} fields</Badge></div>
            <ul className="mt-2 space-y-1.5">{t.fields.map((f) => <li key={f.name} className="flex items-center justify-between rounded-lg border border-green-100 bg-green-50/40 px-3 py-2 text-xs"><span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 rounded-full bg-green-500 p-0.5 text-white" /><span className="font-semibold text-slate-800">{f.name}</span></span><span className="flex items-center gap-1.5 text-[10px] text-slate-400">{f.type === "Text" ? <Type className="h-3 w-3" /> : f.type === "Image" ? <ImageIcon className="h-3 w-3" /> : <Palette className="h-3 w-3" />}{f.type}{f.required && <Badge tone="red">Required</Badge>}{f.max && <span>max {f.max}</span>}</span></li>)}</ul>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">Fixed Elements <Badge tone="slate">Cannot be changed</Badge></div>
            <ul className="mt-2 space-y-1.5">{t.fixed.map((f) => <li key={f} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs"><span className="flex items-center gap-2 text-slate-600"><Lock className="h-3 w-3 text-slate-400" />{f}</span><span className="text-[10px] text-slate-400">Locked</span></li>)}</ul>
          </div>
          <Alert tone="blue" icon={<Shield className="h-3.5 w-3.5 shrink-0" />}><span className="font-semibold">Fixed-Layout Template</span><br />Users may only edit the fields listed above. Layout structure, fonts, element positions, and overall design are locked by the template and cannot be altered by content editors.</Alert>
          <Button href={`/layouts/new/configure?t=${t.id}`} size="lg" className="w-full"><LayoutTemplate className="h-4 w-4" /> Use Template</Button>
          <div className="grid grid-cols-2 gap-2"><Button variant="secondary"><Copy className="h-3.5 w-3.5" /> Duplicate</Button><Button variant="secondary"><Pencil className="h-3.5 w-3.5" /> Edit Template</Button></div>
          <Button variant="danger-outline" className="w-full"><Trash2 className="h-3.5 w-3.5" /> Delete Template</Button>
        </div>
      </div>
    </div>
  );
}
