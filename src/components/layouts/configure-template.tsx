"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, SectionLabel } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Alert, BackLink, Stepper } from "@/components/ui/misc";
import { templates } from "@/lib/data";
import { cn, img } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check, ImageIcon, Lock, Pencil, Save } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function ConfigureTemplate() {
  const router = useRouter();
  const sp = useSearchParams();
  const base = templates.find((t) => t.id === sp.get("t")) ?? templates[7];
  const name = sp.get("name") || (sp.get("t") ? base.name : "Summer Sales");
  const [step, setStep] = useState<2 | 3>(2);
  const [v, setV] = useState({ product: "AirMax Pro 2025", price: "$129.99", tagline: "", cta: "Shop Now", accent: "#2563EB" });
  const done = v.product && v.price && v.cta;

  return (
    <div className="space-y-5">
      <BackLink href="/layouts" label={step === 2 ? "Basic Info" : "Configure"} current={name} />
      <div className="flex justify-end"><Stepper steps={["Basic Info", "Configure", "Preview"]} current={step} compact className="w-full max-w-md" /></div>
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-3">
          <div className="relative rounded-xl border-[6px] border-slate-900 bg-slate-900 shadow-2xl">
            <span className="absolute left-3 top-2 z-10 flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/30" />)}</span>
            <span className={cn("absolute right-3 top-3 z-10 flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold text-white", step === 2 ? "bg-slate-800" : "bg-transparent text-white/50")}>{step === 2 ? <><Lock className="h-2.5 w-2.5" /> FIXED LAYOUT</> : "FINAL PREVIEW"}</span>
            {step === 2 && <span className="absolute left-3 top-8 z-10 rounded bg-green-500 px-2 py-0.5 text-[9px] font-bold text-white">● LIVE PREVIEW</span>}
            <div className="relative aspect-video overflow-hidden rounded-md">
              <img src={img("atrium", 1200, 675)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-r from-rose-800/90 via-rose-700/60 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white"><div className="text-[10px] tracking-[0.25em] opacity-80">NEW ARRIVAL</div><div className="mt-1 text-3xl font-bold">{v.product || "Product Name"}</div><div className="mt-1 text-lg font-semibold" style={{ color: v.accent }}>{v.price || "$—"}</div>{v.tagline && <div className="text-xs opacity-80">{v.tagline}</div>}<span className="mt-3 inline-block w-fit rounded px-3 py-1 text-[10px] font-semibold text-white" style={{ background: v.accent }}>{v.cta || "CTA"}</span></div>
            </div>
          </div>
          {step === 2 ? (
            <>
              <Alert tone="blue" icon={<Lock className="h-3.5 w-3.5 shrink-0" />} className="bg-slate-50 border-slate-200 text-slate-500">Layout geometry, fonts, positions and decorative elements are locked.</Alert>
              <Card className="px-4 py-3"><SectionLabel>Fixed Elements</SectionLabel><ul className="mt-2 space-y-1.5 text-xs text-slate-600">{["Logo position", "Grid layout structure", "Typography hierarchy", "Image crop frame", "CTA button shape"].map((f) => <li key={f} className="flex items-center gap-2"><Lock className="h-3 w-3 text-slate-400" />{f}</li>)}</ul></Card>
            </>
          ) : null}
        </div>

        {step === 2 ? (
          <Card className="px-5 py-5">
            <div className="flex items-center gap-2"><h2 className="text-base font-bold text-slate-900">Configure Template</h2><Badge tone="red">{base.category}</Badge></div>
            <p className="mt-0.5 text-xs text-slate-400">Fill in the editable fields. Changes update the preview in real time.</p>
            <div className="mt-4 space-y-4">
              <div><div className="flex justify-between"><Label required>Product Name</Label><span className="text-[10px] text-slate-400">{v.product.length}/40</span></div><Input value={v.product} onChange={(e) => setV({ ...v, product: e.target.value })} /><p className="mt-1 text-[10px] text-slate-400">Appears as the main headline</p></div>
              <div><div className="flex justify-between"><Label required>Price</Label><span className="text-[10px] text-slate-400">{v.price.length}/15</span></div><Input value={v.price} onChange={(e) => setV({ ...v, price: e.target.value })} /><p className="mt-1 text-[10px] text-slate-400">Displayed prominently below the name</p></div>
              <div><div className="flex justify-between"><Label>Tagline</Label><span className="text-[10px] text-slate-400">{v.tagline.length}/60</span></div><Input placeholder="Performance, redefined." value={v.tagline} onChange={(e) => setV({ ...v, tagline: e.target.value })} /><p className="mt-1 text-[10px] text-slate-400">Supporting line under the headline</p></div>
              <div><Label required>Product Image</Label><div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"><span className="flex items-center gap-3"><img src={img("atrium", 64, 64)} alt="" className="h-8 w-8 rounded object-cover" /><span><span className="block text-xs font-semibold text-slate-800">Current image</span><span className="block text-[10px] text-slate-400">Click to change</span></span></span><Button variant="secondary" size="sm"><ImageIcon className="h-3.5 w-3.5" /> Change Image</Button></div><p className="mt-1 text-[10px] text-slate-400">Main product visual (16:9 or square)</p></div>
              <div><div className="flex justify-between"><Label required>CTA Text</Label><span className="text-[10px] text-slate-400">{v.cta.length}/20</span></div><Input value={v.cta} onChange={(e) => setV({ ...v, cta: e.target.value })} /><p className="mt-1 text-[10px] text-slate-400">Call-to-action button label</p></div>
              <div><Label>Accent Color</Label><div className="flex gap-2"><input type="color" value={v.accent} onChange={(e) => setV({ ...v, accent: e.target.value })} className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1" /><Input value={v.accent} onChange={(e) => setV({ ...v, accent: e.target.value })} className="flex-1 font-mono uppercase" /></div><p className="mt-1 text-[10px] text-slate-400">Highlight color for price &amp; CTA</p></div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader title={name} subtitle={<span className="flex items-center gap-2"><Badge tone="red">{base.category}</Badge>Landscape · 16:9</span>} />
              <div className="px-5 py-4"><SectionLabel>Configured Values</SectionLabel><dl className="mt-2 divide-y divide-slate-100 text-xs">{[["Product Name", v.product], ["Price", v.price.replace("$", "")], ["Tagline", v.tagline || "—"], ["CTA Text", v.cta]].map(([k, val]) => <div key={k} className="flex justify-between py-2"><dt className="text-slate-400">{k}</dt><dd className="font-semibold text-slate-800">{val}</dd></div>)}</dl></div>
            </Card>
            <Alert tone="green" icon={<Check className="h-3.5 w-3.5 shrink-0" />}><span className="font-semibold">Template ready to save</span><br />All required fields are complete. You can save and publish this template.</Alert>
          </div>
        )}
      </div>
      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => step === 3 ? setStep(2) : router.push("/layouts")}><ArrowLeft className="h-3.5 w-3.5" /> Back</Button>
        {step === 2 ? <div className="flex gap-2"><Button variant="secondary"><Save className="h-3.5 w-3.5" /> Save Draft</Button><Button disabled={!done} onClick={() => setStep(3)}>Continue to Preview <ArrowRight className="h-3.5 w-3.5" /></Button></div> : <div className="flex gap-2"><Button variant="secondary" onClick={() => setStep(2)}><Pencil className="h-3.5 w-3.5" /> Edit Fields</Button><Button variant="success" onClick={() => router.push("/layouts")}><Check className="h-3.5 w-3.5" /> Save Template</Button></div>}
      </div>
    </div>
  );
}
