"use client";
/**
 * "Who sees it" for Head Office content: every location, the locations in chosen categories
 * (Kiosk, Restaurant, ...), or chosen locations. Used by offers, templates and campaigns.
 */
import { Button } from "@/components/ui/button";
import { Checkbox, PillTabs, SearchInput } from "@/components/ui/input";
import { Modal, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { errorMessage } from "@/lib/format";
import { useCategories } from "@/lib/api/hooks/categories";
import { useCompanies, useCompanyNames } from "@/lib/api/hooks/companies";
import type { TargetAudience } from "@/lib/api/types";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { z } from "zod";

export const EVERYONE: TargetAudience = { kind: "all" };

/** Form field: the same three shapes, with at least one category or location chosen. */
export const audienceField = () =>
  z.union([
    z.object({ kind: z.literal("all") }),
    z.object({ kind: z.literal("categories"), categoryIds: z.array(z.string()).min(1, "Choose at least one category") }),
    z.object({ kind: z.literal("companies"), companyIds: z.array(z.string()).min(1, "Choose at least one location") }),
  ]);

/** Plain words for an audience: "All locations", "Kiosk and Restaurant", "Bar 1, Bar 2 and 3 more". */
export function useAudienceLabel() {
  const categories = useCategories();
  const { names } = useCompanyNames();
  const catNames = useMemo(() => Object.fromEntries((categories.data ?? []).map((c) => [c.id, c.name])) as Record<string, string>, [categories.data]);
  return (a: TargetAudience | null | undefined) => {
    if (!a || a.kind === "all") return "All locations";
    const list = a.kind === "categories" ? a.categoryIds.map((id) => catNames[id] ?? "a removed category") : a.companyIds.map((id) => names[id] ?? "a location");
    const shown = list.slice(0, 2);
    const rest = list.length - shown.length;
    const text = rest > 0 ? `${shown.join(", ")} and ${rest} more` : shown.length === 2 ? `${shown[0]} and ${shown[1]}` : shown[0] ?? "";
    return a.kind === "categories" ? `${text} only` : text;
  };
}

export function AudiencePicker({ value, onChange, error, className }: { value: TargetAudience; onChange: (a: TargetAudience) => void; error?: string; className?: string }) {
  const categories = useCategories();
  const [q, setQ] = useState("");
  const search = useDebouncedValue(q.trim(), 300);
  const companies = useCompanies({ search: search || undefined, pageSize: 100 }, { enabled: value.kind === "companies" });
  const { names } = useCompanyNames();
  const chosenCats = value.kind === "categories" ? value.categoryIds : [];
  const chosenCos = value.kind === "companies" ? value.companyIds : [];
  const toggle = (list: string[], id: string, on: boolean) => (on ? [...new Set([...list, id])] : list.filter((x) => x !== id));
  const box = (bad: boolean) => cn("mt-2 max-h-56 space-y-0.5 overflow-y-auto rounded-lg border p-1.5", bad ? "border-red-400" : "border-slate-200");

  return (
    <div className={className}>
      <PillTabs
        options={[{ value: "all" as const, label: "All locations" }, { value: "categories" as const, label: "By category" }, { value: "companies" as const, label: "Chosen locations" }]}
        value={value.kind}
        onChange={(kind) => onChange(kind === "all" ? EVERYONE : kind === "categories" ? { kind, categoryIds: chosenCats } : { kind, companyIds: chosenCos })}
      />
      {value.kind === "all" && <p className="mt-2 text-[11px] text-slate-500">Every location sees it, including ones added later.</p>}
      {value.kind === "categories" && (
        categories.isPending ? <p className="mt-2 text-xs text-slate-400">Loading categories…</p>
          : !(categories.data ?? []).length ? <p className="mt-2 text-xs text-slate-500">No categories yet. Add them in Settings.</p>
            : <ul className={box(!!error)}>{(categories.data ?? []).map((c) => (
                <li key={c.id}><label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-xs hover:bg-slate-50 sm:py-1.5">
                  <Checkbox checked={chosenCats.includes(c.id)} onChange={(on) => onChange({ kind: "categories", categoryIds: toggle(chosenCats, c.id, on) })} />
                  <span className="flex-1 font-medium text-slate-800">{c.name}</span><span className="text-slate-400">{c.companies} location{c.companies === 1 ? "" : "s"}</span>
                </label></li>
              ))}</ul>
      )}
      {value.kind === "categories" && <p className="mt-1.5 text-[11px] text-slate-500">Locations added to these categories later see it too.</p>}
      {value.kind === "companies" && (
        <>
          <SearchInput placeholder="Search locations..." className="mt-2 w-full" maxLength={100} value={q} onChange={(e) => setQ(e.target.value)} />
          {chosenCos.length > 0 && <p className="mt-1.5 text-[11px] text-slate-600">{chosenCos.length} chosen: {chosenCos.slice(0, 4).map((id) => names[id] ?? "a location").join(", ")}{chosenCos.length > 4 ? "…" : ""}</p>}
          {companies.isPending ? <p className="mt-2 text-xs text-slate-400">Loading locations…</p> : (
            <ul className={box(!!error)}>
              {(companies.data?.data ?? []).length === 0 && <li className="px-2 py-2 text-xs text-slate-400">No locations match.</li>}
              {(companies.data?.data ?? []).map((c) => (
                <li key={c.id}><label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-xs hover:bg-slate-50 sm:py-1.5">
                  <Checkbox checked={chosenCos.includes(c.id)} onChange={(on) => onChange({ kind: "companies", companyIds: toggle(chosenCos, c.id, on) })} />
                  <span className="flex-1 truncate font-medium text-slate-800">{c.name}</span><span className="text-slate-400">{c.category?.name ?? "No category"}</span>
                </label></li>
              ))}
            </ul>
          )}
        </>
      )}
      {error && <p role="alert" className="mt-1 text-[11px] font-medium text-red-600">{error}</p>}
    </div>
  );
}

/** The message from a react-hook-form error on an audience field, wherever it sits inside it. */
export function audienceError(e: unknown): string | undefined {
  const err = e as { message?: string; categoryIds?: { message?: string }; companyIds?: { message?: string } } | undefined;
  return err?.message ?? err?.categoryIds?.message ?? err?.companyIds?.message;
}

/** API error paths for an audience, mapped to the form field. */
export const AUDIENCE_API_FIELDS: Record<string, string> = { audience: "audience", "audience.categoryIds": "audience", "audience.companyIds": "audience" };

/** "Who sees it" summary with a Change button that opens the picker in a dialog. */
export function AudienceCard({ title, value, onSave }: { title: string; value: TargetAudience; onSave: (a: TargetAudience) => Promise<unknown> }) {
  const labelOf = useAudienceLabel();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TargetAudience>(value);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    const parsed = audienceField().safeParse(draft);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Choose who sees it"); return; }
    setSaving(true); setError("");
    try { await onSave(parsed.data); setOpen(false); } catch (e) { setError(errorMessage(e)); } finally { setSaving(false); }
  };
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0"><div className="text-[11px] text-slate-400">{title}</div><div className="truncate text-sm font-semibold text-slate-900">{labelOf(value)}</div></div>
        <Button size="sm" variant="secondary" onClick={() => { setDraft(value); setError(""); setOpen(true); }}>Change</Button>
      </div>
      <Modal open={open} onClose={() => !saving && setOpen(false)} width="max-w-[480px]">
        <ModalHeader title={title} onClose={() => !saving && setOpen(false)} />
        <div className="px-6 py-5"><AudiencePicker value={draft} onChange={(a) => { setDraft(a); setError(""); }} error={error} /></div>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button type="button" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

/** Small label for lists: who the item is for. */
export function AudienceBadge({ audience, className }: { audience?: TargetAudience | null; className?: string }) {
  const labelOf = useAudienceLabel();
  return <span className={cn("inline-flex max-w-full items-center truncate rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600", className)} title="Who sees it">{labelOf(audience)}</span>;
}
