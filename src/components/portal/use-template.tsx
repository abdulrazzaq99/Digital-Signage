"use client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/misc";
import { QueryState, Skeleton } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { useCreateInstance, usePublishInstance, useRenderInstance, useTemplateInstance, useTemplates, useUpdateInstance } from "@/lib/api/hooks/templates";
import type { Template, TemplateInstance } from "@/lib/api/types";
import { errorMessage, label } from "@/lib/format";
import { Lock, Save, Send, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLinkButton } from "./portal-stepper";
import { PublishTarget } from "./publish-target";
import { PortalTemplateArt } from "./template-art";

/**
 * Fill a template's fields → create the instance → render it on the API → publish.
 * The instance is created on "Generate" so the rendered output is real, not a client mock-up.
 */
function Flow({ template, companyId, basePath }: { template: Template; companyId?: string | null; basePath: string }) {
  const router = useRouter();
  const toast = useToast();
  const create = useCreateInstance(companyId);
  const update = useUpdateInstance(companyId);
  const render = useRenderInstance(companyId);
  const publish = usePublishInstance(companyId);
  const [name, setName] = useState(template.name);
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(template.fields.map((f) => [f.key, ""])));
  const [instance, setInstance] = useState<TemplateInstance | null>(null);
  const [phase, setPhase] = useState<"edit" | "output" | "publish">("edit");
  const [error, setError] = useState("");
  // Rendering is asynchronous (202); poll the instance until the worker has produced the output image.
  const live = useTemplateInstance(instance?.id ?? "", { companyId, enabled: !!instance && !instance.rendered, refetchInterval: 2000 });
  const current = live.data && instance && live.data.id === instance.id ? live.data : instance;
  const valid = template.fields.every((f) => !f.required || values[f.key]?.trim()) && name.trim().length > 0;
  const listHref = `${basePath}?tab=templates`;
  const busy = create.isPending || update.isPending || render.isPending;

  const generate = async () => {
    setError("");
    try {
      const filled = Object.fromEntries(Object.entries(values).filter(([, v]) => v.trim() !== ""));
      const inst = instance ? await update.mutateAsync({ id: instance.id, name: name.trim(), values: filled }) : await create.mutateAsync({ templateId: template.id, name: name.trim(), values: filled });
      setInstance(await render.mutateAsync(inst.id));
      setPhase("output");
    } catch (e) { setError(errorMessage(e)); }
  };

  if (phase === "publish" && current) return <PublishTarget subject={current.name} companyId={companyId} onPublish={(sel) => publish.mutateAsync({ id: current.id, ...sel })} onBack={() => setPhase("output")} onDone={() => router.push(listHref)} />;

  if (phase === "output" && current) return (
    <div className="space-y-4 animate-fade-in">
      <BackLinkButton label="Edit Template" onClick={() => setPhase("edit")} />
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-bold tracking-tight text-slate-900">{current.name} — Output</h1><p className="text-xs text-slate-400">{current.rendered ? "Rendered and saved to your library." : "Saved; rendering is still in progress."}</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setPhase("edit")}>Back to Edit</Button><Button variant="secondary" onClick={() => { toast.success("Saved", current.name); router.push(listHref); }}><Save className="h-3.5 w-3.5" /> Save</Button><Button onClick={() => setPhase("publish")}><Send className="h-3.5 w-3.5" /> Publish</Button></div></div>
      <div className="max-w-[580px]">
        {current.outputUrl ? <img src={current.outputUrl} alt={current.name} className="aspect-video w-full rounded-lg bg-slate-900 object-contain shadow-xl" /> : <PortalTemplateArt template={template} values={values} className="text-2xl shadow-xl" />}
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400"><Lock className="h-3 w-3" /> Design locked — only the fields are editable.</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <BackLinkButton label="Templates" onClick={() => router.push(listHref)} />
      <div><h1 className="text-lg font-bold tracking-tight text-slate-900">{template.name}</h1><p className="text-xs text-slate-400">{template.category} · {label(template.orientation).toLowerCase()}</p></div>
      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        <div><PortalTemplateArt template={template} values={values} className="text-xl shadow-xl" /><div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400"><Lock className="h-3 w-3" /> Live preview — the API renders the final image.</div></div>
        <form onSubmit={(e) => { e.preventDefault(); generate(); }} className="space-y-4">
          <div><Label required>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekend Flash Sale" /></div>
          {template.fields.map((f) => <div key={f.key}><Label required={f.required}>{f.label}</Label><Input placeholder={f.type === "image" ? "Image URL" : f.type === "color" ? "#RRGGBB" : f.label} type={f.type === "color" ? "color" : "text"} maxLength={f.max} value={values[f.key] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} /></div>)}
          {error && <Alert tone="red">{error}</Alert>}
          <Button type="submit" className="w-full" disabled={!valid || busy}><Sparkles className="h-3.5 w-3.5" /> {busy ? "Generating…" : "Generate Output"}</Button>
        </form>
      </div>
    </div>
  );
}

export function UseTemplate({ id, companyId, basePath = "/portal/layouts" }: { id: string; companyId?: string | null; basePath?: string }) {
  const templates = useTemplates();
  return (
    <QueryState query={templates} skeleton={<div className="grid gap-6 xl:grid-cols-[400px_1fr]"><Skeleton className="aspect-video" /><Skeleton className="h-64" /></div>}>
      {({ data }) => { const t = data.find((x) => x.id === id); return t ? <Flow key={t.id} template={t} companyId={companyId} basePath={basePath} /> : <div className="text-sm text-slate-500">Template not found.</div>; }}
    </QueryState>
  );
}
