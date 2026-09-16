"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, companyHeader, idempotencyKey, request, requestData, requestPage } from "../client";
import { keys } from "../query";
import type { Layout, Page, PublishResult, Schemas } from "../types";
import type { ScopeOpts } from "./screens";

/** The five fixed zone presets; geometry is fractional (x, y, w, h in 0..1). */
export function usePresets() {
  return useQuery<Page<Layout>, ApiError>({ queryKey: [...keys.layouts, "presets"], queryFn: () => requestPage(() => api.GET("/layouts/presets")), staleTime: 10 * 60_000 });
}

export function useLayouts(opts: ScopeOpts = {}) {
  return useQuery<Page<Layout>, ApiError>({
    queryKey: [...keys.layouts, opts.companyId ?? "own"],
    queryFn: () => requestPage(() => api.GET("/layouts", { headers: companyHeader(opts.companyId) })),
    enabled: opts.enabled ?? true,
  });
}

export function useLayout(id: string, opts: ScopeOpts = {}) {
  return useQuery<Layout, ApiError>({
    queryKey: [...keys.layouts, "detail", id],
    queryFn: () => requestData(() => api.GET("/layouts/{id}", { params: { path: { id } }, headers: companyHeader(opts.companyId) })),
    enabled: (opts.enabled ?? true) && !!id,
  });
}

function useInvalidateLayouts() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: keys.layouts });
}

export function useCreateLayout(companyId?: string | null) {
  const invalidate = useInvalidateLayouts();
  return useMutation<Layout, ApiError, Schemas["CreateLayoutBody"]>({
    mutationFn: (body) => requestData(() => api.POST("/layouts", { body, headers: companyHeader(companyId) })),
    onSuccess: () => invalidate(),
  });
}

export function useBindZone(companyId?: string | null) {
  const invalidate = useInvalidateLayouts();
  return useMutation<Layout, ApiError, { id: string; index: number } & Schemas["BindZoneBody"]>({
    mutationFn: ({ id, index, ...body }) => requestData(() => api.PUT("/layouts/{id}/zones/{index}", { params: { path: { id, index } }, body, headers: companyHeader(companyId) })),
    onSuccess: () => invalidate(),
  });
}

export function useClearZone(companyId?: string | null) {
  const invalidate = useInvalidateLayouts();
  return useMutation<Layout, ApiError, { id: string; index: number }>({
    mutationFn: ({ id, index }) => requestData(() => api.DELETE("/layouts/{id}/zones/{index}", { params: { path: { id, index } }, headers: companyHeader(companyId) })) as Promise<Layout>,
    onSuccess: () => invalidate(),
  });
}

export function useDeleteLayout(companyId?: string | null) {
  const invalidate = useInvalidateLayouts();
  return useMutation<void, ApiError, string>({
    mutationFn: async (id) => { await request(() => api.DELETE("/layouts/{id}", { params: { path: { id } }, headers: companyHeader(companyId) })); },
    onSuccess: () => invalidate(),
  });
}

export function usePublishLayout(companyId?: string | null) {
  const qc = useQueryClient();
  return useMutation<PublishResult, ApiError, { id: string; screenIds: string[]; groupIds: string[] }>({
    mutationFn: ({ id, ...body }) => requestData(() => api.POST("/layouts/{id}/publish", { params: { path: { id }, header: idempotencyKey() }, body, headers: companyHeader(companyId) })),
    onSuccess: () => Promise.all([keys.layouts, keys.screens, keys.groups].map((k) => qc.invalidateQueries({ queryKey: k }))),
  });
}
