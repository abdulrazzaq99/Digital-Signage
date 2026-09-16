"use client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { PortalTemplate } from "@/lib/portal-data";
import { Lock, Save, Send, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLinkButton } from "./portal-stepper";
import { PublishTarget } from "./publish-target";
import { PortalTemplateArt } from "./template-art";

export function UseTemplate({ template }: { template: PortalTemplate }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(template.fields.map((f) => [f.key, f.defaultValue])));
  const [phase, setPhase] = useState<"edit" | "output" | "publish">("edit");
  const valid = template.fields.every((f) => !f.required || values[f.key]?.trim());

  if (phase === "publish") return <PublishTarget subject={template.name} onBack={() => setPhase("output")} onDone={() => router.push("/portal/layouts?tab=templates")} />;

  if (phase === "output") return (
    <div className="space-y-4 animate-fade-in">
      <BackLinkButton label="Edit Template" onClick={() => setPhase("edit")} />
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-bold tracking-tight text-slate-900">{template.name} — Output</h1><p className="text-xs text-slate-400">Your generated content is ready.</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setPhase("edit")}>Back to Edit</Button><Button variant="secondary" onClick={() => router.push("/portal/layouts?tab=templates")}><Save className="h-3.5 w-3.5" /> Save</Button><Button onClick={() => setPhase("publish")}><Send className="h-3.5 w-3.5" /> Save &amp; Publish</Button></div></div>
      <div className="max-w-[580px]"><PortalTemplateArt template={template} values={values} className="text-2xl shadow-xl" /><div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400"><Lock className="h-3 w-3" /> Design locked — only the fields below are editable.</div></div>
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <BackLinkButton label="Templates" onClick={() => router.push("/portal/layouts?tab=templates")} />
      <div><h1 className="text-lg font-bold tracking-tight text-slate-900">{template.name}</h1><p className="text-xs text-slate-400">{template.category} · {template.orientation.toLowerCase()}</p></div>
      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        <div><PortalTemplateArt template={template} values={values} className="text-xl shadow-xl" /><div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400"><Lock className="h-3 w-3" /> Design locked — only the fields below are editable.</div></div>
        <form onSubmit={(e) => { e.preventDefault(); setPhase("output"); }} className="space-y-4">
          {template.fields.map((f) => <div key={f.key}><Label required={f.required}>{f.label}</Label><Input placeholder={f.placeholder} value={values[f.key] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} /></div>)}
          <Button type="submit" className="w-full" disabled={!valid}><Sparkles className="h-3.5 w-3.5" /> Generate Output</Button>
        </form>
      </div>
    </div>
  );
}
