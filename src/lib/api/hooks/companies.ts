"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { api, ApiError, request, requestData, requestPage } from "../client";
import { clean, keys } from "../query";
import type { Company, Page, Schemas } from "../types";

/** `counts` is present on every read; write responses omit it. This keeps UI code free of optional chaining. */
export const counts = (c: Company) => c.counts ?? { screens: 0, online: 0, offline: 0, available: c.license?.screenLimit ?? 0 };

export interface CompanyFilters { search?: string; status?: Company["status"]; page?: number; pageSize?: number }

export function useCompanies(filters: CompanyFilters = {}, opts: { enabled?: boolean } = {}) {
  const query = clean(filters);
  return useQuery<Page<Company>, ApiError>({
    queryKey: [...keys.companies, query],
    queryFn: () => requestPage(() => api.GET("/companies", { params: { query } })),
    enabled: opts.enabled ?? true,
  });
}

/** Id → name map for joining company names into platform-wide lists (Super Admin only). */
export function useCompanyNames() {
  const q = useQuery<Page<Company>, ApiError>({
    queryKey: [...keys.companies, "names"],
    queryFn: () => requestPage(() => api.GET("/companies", { params: { query: { pageSize: 100 } } })),
    staleTime: 5 * 60_000,
  });
  const names = useMemo(() => Object.fromEntries((q.data?.data ?? []).map((c) => [c.id, c.name])) as Record<string, string>, [q.data]);
  return { names, companies: q.data?.data ?? [], isPending: q.isPending };
}

export function useCompany(id: string, opts: { enabled?: boolean } = {}) {
  return useQuery<Company, ApiError>({
    queryKey: [...keys.companies, "detail", id],
    queryFn: () => requestData(() => api.GET("/companies/{id}", { params: { path: { id } } })),
    enabled: (opts.enabled ?? true) && !!id,
  });
}

function useInvalidateCompanies() {
  const qc = useQueryClient();
  return () => Promise.all([keys.companies, keys.licenses].map((k) => qc.invalidateQueries({ queryKey: k })));
}

export function useCreateCompany() {
  const invalidate = useInvalidateCompanies();
  return useMutation<Company, ApiError, Schemas["CreateCompanyBody"]>({
    mutationFn: (body) => requestData(() => api.POST("/companies", { body })),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateCompany(id: string) {
  const invalidate = useInvalidateCompanies();
  return useMutation<Company, ApiError, Schemas["UpdateCompanyBody"]>({
    mutationFn: (body) => requestData(() => api.PATCH("/companies/{id}", { params: { path: { id } }, body })),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: async (id) => { await request(() => api.DELETE("/companies/{id}", { params: { path: { id } } })); },
    onSuccess: () => qc.invalidateQueries(),
  });
}
