import type { Template } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const isHex6 = (v?: string) => !!v && /^#[0-9a-fA-F]{6}$/.test(v);

/**
 * Client-side preview of a template, laid out the way the API renders it: the first text field as
 * the headline, the other text fields under it, image fields in a panel beside them, and the first
 * colour as the accent. It follows the fields in order, so every field's value shows as you type.
 * The real render (a PNG in storage) is produced by the API.
 */
export function PortalTemplateArt({ template, values, className }: { template: Pick<Template, "name" | "category" | "fields"> & { images?: Record<string, string> }; values?: Record<string, string>; className?: string }) {
  const fields = template.fields ?? [];
  // Without values (a gallery card), each field shows its label.
  const shown = (key: string, label: string) => (values ? values[key]?.trim() ?? "" : label);
  const texts = fields.filter((f) => f.type === "text").map((f) => ({ key: f.key, text: shown(f.key, f.label) })).filter((t) => t.text);
  const images = fields.filter((f) => f.type === "image");
  const accentField = fields.find((f) => f.type === "color" && isHex6(values?.[f.key] ?? f.default));
  const accent = accentField ? (values?.[accentField.key] ?? accentField.default)! : "#3b82f6";
  const [headline, ...rest] = texts;
  return (
    <div className={cn("relative flex aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white", className)}>
      <div className={cn("flex min-w-0 flex-col justify-center p-[6%]", images.length ? "w-[58%]" : "w-full")}>
        {headline ? <div className="line-clamp-3 break-words text-[1.5em] font-black leading-[1.1]" style={{ color: accent }}>{headline.text}</div> : <div className="text-[0.6em] text-white/40">{template.name}</div>}
        {rest.map((t) => <div key={t.key} className="mt-[3%] line-clamp-2 break-words text-[0.75em] font-semibold leading-tight text-white/85">{t.text}</div>)}
      </div>
      {images.length > 0 && (
        <div className="flex w-[42%] flex-col gap-[3%] py-[5%] pr-[5%]">
          {images.map((f) => {
            const url = template.images?.[f.key];
            return url ? <img key={f.key} src={url} alt="" className="min-h-0 flex-1 rounded object-cover" /> : <div key={f.key} className="flex min-h-0 flex-1 items-center justify-center rounded border border-dashed border-white/25 text-[0.45em] text-white/50">{f.label}</div>;
          })}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-[3%]" style={{ background: accent }} />
    </div>
  );
}
