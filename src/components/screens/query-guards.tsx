"use client";
/**
 * Loading / error / "nothing chosen yet" states for the secondary queries behind selects and
 * pickers, and for Super Admin pages scoped to a company. A failed or disabled query must never
 * look like an empty list ("no groups") or spin forever.
 */
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { EmptyState, ErrorState } from "@/components/ui/query-state";
import { useQuery } from "@tanstack/react-query";
import { api, ApiError, requestPage } from "@/lib/api/client";
import { keys } from "@/lib/api/query";
import type { Company, Page } from "@/lib/api/types";
import { errorMessage } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Building2, RefreshCw } from "lucide-react";
import type { ReactNode, SelectHTMLAttributes } from "react";

export interface QueryLike { isPending: boolean; isError: boolean; error: unknown; fetchStatus?: string; refetch: () => unknown }

/** A disabled query (e.g. no company chosen) stays `isPending` forever in TanStack v5; this tells it apart from loading. */
export const isIdle = (q: Pick<QueryLike, "isPending" | "fetchStatus">) => q.isPending && q.fetchStatus === "idle";

/**
 * One line under a select/picker: "Loading groups…", or the error with a Retry link. Renders nothing
 * once the data is there (or while the query is idle, where the caller shows its own prompt).
 */
export function QueryNotice({ query, what, className }: { query: QueryLike; what: string; className?: string }) {
  if (query.isError) {
    return (
      <p role="alert" className={cn("mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-red-600", className)}>
        Couldn&apos;t load {what}: {errorMessage(query.error)}
        <button type="button" onClick={() => query.refetch()} className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"><RefreshCw className="h-3 w-3" /> Retry</button>
      </p>
    );
  }
  if (query.isPending && !isIdle(query)) return <p className={cn("mt-1 text-[11px] text-slate-400", className)} aria-live="polite">Loading {what}…</p>;
  return null;
}

/** Block-level version for pickers that are lists rather than selects. */
export function QueryBlock({ query, what, skeleton, children }: { query: QueryLike; what: string; skeleton: ReactNode; children: ReactNode }) {
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} className="p-4" />;
  if (query.isPending) return <>{isIdle(query) ? <p className="text-xs text-slate-400">Choose a company to see its {what}.</p> : skeleton}</>;
  return <>{children}</>;
}

/**
 * The same company list `useCompanyNames` reads (shared cache key), with its loading and error
 * state exposed so company pickers can show them.
 */
export function useCompanyOptions() {
  return useQuery<Page<Company>, ApiError>({
    queryKey: [...keys.companies, "names"],
    queryFn: () => requestPage(() => api.GET("/companies", { params: { query: { pageSize: 100 } } })),
    staleTime: 5 * 60_000,
  });
}

/** Company `<select>` that says when the list is loading or failed instead of rendering empty. */
export function CompanySelect({ value, onChange, className, placeholder, ...rest }: Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> & { value: string; onChange: (id: string) => void; placeholder?: string }) {
  const companies = useCompanyOptions();
  const list = companies.data?.data ?? [];
  return (
    <div className={className}>
      <Select value={value} onChange={(e) => onChange(e.target.value)} disabled={!companies.data || rest.disabled} {...rest}>
        {!companies.data ? <option value="">{companies.isError ? "Couldn't load companies" : "Loading companies…"}</option> : (
          <>
            {(placeholder || !value) && <option value="" disabled={!placeholder}>{placeholder ?? (list.length ? "Choose a company" : "No companies yet")}</option>}
            {list.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </>
        )}
      </Select>
      <QueryNotice query={companies} what="companies" />
    </div>
  );
}

/**
 * Gate for Super Admin pages that need a company: loading, error with Retry, "no companies" and
 * "choose a company" states, so a disabled company-scoped query never renders as an endless skeleton.
 */
export function CompanyGate({ companyId, children, skeleton, what = "this page" }: { companyId: string; children: ReactNode; skeleton?: ReactNode; what?: string }) {
  const companies = useCompanyOptions();
  if (companyId) return <>{children}</>;
  if (companies.isError) return <ErrorState error={companies.error} onRetry={() => companies.refetch()} />;
  if (companies.isPending) return <>{skeleton ?? null}</>;
  return (companies.data?.data.length ?? 0) === 0
    ? <EmptyState icon={<Building2 className="h-5 w-5" />} title="No companies yet" body={`Create a company before using ${what}.`} action={<Button href="/companies" variant="secondary">Go to Companies</Button>} />
    : <EmptyState icon={<Building2 className="h-5 w-5" />} title="Choose a company" body={`Pick a company to see ${what}.`} />;
}
