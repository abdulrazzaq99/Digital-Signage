"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, companyHeader, idempotencyKey, request, requestData, requestPage } from "../client";
import { keys } from "../query";
import type { CanvasSet, Page, Schemas } from "../types";
import type { ScopeOpts } from "./screens";

export function useCanvases(opts: ScopeOpts = {}) {
  return useQuery<Page<CanvasSet>, ApiError>({
    queryKey: [...keys.canvas, opts.companyId ?? "own"],
    queryFn: () => requestPage(() => api.GET("/canvas", { headers: companyHeader(opts.companyId) })),
    enabled: opts.enabled ?? true,
  });
}

export function useCanvas(id: string, opts: ScopeOpts = {}) {
  return useQuery<CanvasSet, ApiError>({
    queryKey: [...keys.canvas, "detail", id],
    queryFn: () => requestData(() => api.GET("/canvas/{id}", { params: { path: { id } }, headers: companyHeader(opts.companyId) })),
    enabled: (opts.enabled ?? true) && !!id,
  });
}

function useInvalidateCanvas() {
  const qc = useQueryClient();
  return () => Promise.all([keys.canvas, keys.screens].map((k) => qc.invalidateQueries({ queryKey: k })));
}

export function useCreateCanvas(companyId?: string | null) {
  const invalidate = useInvalidateCanvas();
  return useMutation<CanvasSet, ApiError, Schemas["CreateCanvasBody"]>({
    mutationFn: (body) => requestData(() => api.POST("/canvas", { body, headers: companyHeader(companyId) })),
    onSuccess: () => invalidate(),
  });
}

/** Id travels with the variables so a canvas created moments ago can be updated without re-rendering. */
export function useUpdateCanvas(companyId?: string | null) {
  const invalidate = useInvalidateCanvas();
  return useMutation<CanvasSet, ApiError, { id: string } & Schemas["UpdateCanvasBody"]>({
    mutationFn: ({ id, ...body }) => requestData(() => api.PATCH("/canvas/{id}", { params: { path: { id } }, body, headers: companyHeader(companyId) })),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteCanvas(companyId?: string | null) {
  const invalidate = useInvalidateCanvas();
  return useMutation<void, ApiError, string>({
    mutationFn: async (id) => { await request(() => api.DELETE("/canvas/{id}", { params: { path: { id } }, headers: companyHeader(companyId) })); },
    onSuccess: () => invalidate(),
  });
}

export function useActivateCanvas(companyId?: string | null) {
  const invalidate = useInvalidateCanvas();
  return useMutation<CanvasSet, ApiError, string>({
    mutationFn: (id) => requestData(() => api.POST("/canvas/{id}/activate", { params: { path: { id }, header: idempotencyKey() }, headers: companyHeader(companyId) })),
    onSuccess: () => invalidate(),
  });
}

export function useDeactivateCanvas(companyId?: string | null) {
  const invalidate = useInvalidateCanvas();
  return useMutation<CanvasSet, ApiError, string>({
    mutationFn: (id) => requestData(() => api.POST("/canvas/{id}/deactivate", { params: { path: { id } }, headers: companyHeader(companyId) })),
    onSuccess: () => invalidate(),
  });
}
