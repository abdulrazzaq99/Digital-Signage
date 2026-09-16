"use client";
import { FilterSelect } from "@/components/ui/input";
import { useCompanyNames } from "@/lib/api/hooks/companies";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Super Admin pages that read tenant-owned resources (groups, canvases, playlists…) need a target
 * company. It lives in `?company=` so links between admin pages keep the selection; when absent,
 * the first company is used.
 */
export function useCompanyScope(options: { required?: boolean } = { required: true }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { companies, names, isPending } = useCompanyNames();
  const fromUrl = params.get("company") ?? "";
  const companyId = fromUrl || (options.required ? companies[0]?.id ?? "" : "");
  const setCompanyId = useCallback((id: string) => {
    const next = new URLSearchParams(params.toString());
    if (id) next.set("company", id); else next.delete("company");
    router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`);
  }, [params, pathname, router]);
  /** Appends the current company to an admin link so the target page opens in the same scope. */
  const withCompany = useCallback((href: string) => (companyId ? `${href}${href.includes("?") ? "&" : "?"}company=${companyId}` : href), [companyId]);
  return { companyId, companyName: names[companyId] ?? "", setCompanyId, withCompany, companies, names, isPending };
}

export function CompanyFilter({ value, onChange, allLabel = "All Companies", className }: { value: string; onChange: (id: string) => void; allLabel?: string; className?: string }) {
  const { companies } = useCompanyNames();
  return <FilterSelect label={allLabel} options={companies.map((c) => ({ value: c.id, label: c.name }))} value={value} onChange={onChange} className={className} />;
}
