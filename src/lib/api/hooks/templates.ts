"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, companyHeader, idempotencyKey, request, requestData, requestPage } from "../client";
import { keys } from "../query";
import type { Page, PublishResult, Schemas, Template, TemplateInstance } from "../types";
import type { ScopeOpts } from "./screens";

/** Templates are platform-wide definitions (created by the Super Admin); instances belong to a company. */
export function useTemplates() {
  return useQuery<Page<Template>, ApiError>({ queryKey: [...keys.templates], queryFn: () => requestPage(() => api.GET("/templates")) });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation<Template, ApiError, Schemas["CreateTemplateBody"]>({
    mutationFn: (body) => requestData(() => api.POST("/templates", { body })),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.templates }),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: async (id) => { await request(() => api.DELETE("/templates/{id}", { params: { path: { id } } })); },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.templates }),
  });
}

export function useTemplateInstances(opts: ScopeOpts = {}) {
  return useQuery<Page<TemplateInstance>, ApiError>({
    queryKey: [...keys.instances, opts.companyId ?? "own"],
    queryFn: () => requestPage(() => api.GET("/template-instances", { headers: companyHeader(opts.companyId) })),
    enabled: opts.enabled ?? true,
  });
}

export function useTemplateInstance(id: string, opts: ScopeOpts & { refetchInterval?: number | false } = {}) {
  return useQuery<TemplateInstance, ApiError>({
    queryKey: [...keys.instances, "detail", id],
    queryFn: () => requestData(() => api.GET("/template-instances/{id}", { params: { path: { id } }, headers: companyHeader(opts.companyId) })),
    enabled: (opts.enabled ?? true) && !!id,
    refetchInterval: opts.refetchInterval ?? false,
  });
}

function useInvalidateInstances() {
  const qc = useQueryClient();
  return () => Promise.all([keys.instances, keys.templates].map((k) => qc.invalidateQueries({ queryKey: k })));
}

export function useCreateInstance(companyId?: string | null) {
  const invalidate = useInvalidateInstances();
  return useMutation<TemplateInstance, ApiError, Schemas["CreateTemplateInstanceBody"]>({
    mutationFn: (body) => requestData(() => api.POST("/template-instances", { body, headers: companyHeader(companyId) })),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateInstance(companyId?: string | null) {
  const invalidate = useInvalidateInstances();
  return useMutation<TemplateInstance, ApiError, { id: string } & Schemas["UpdateTemplateInstanceBody"]>({
    mutationFn: ({ id, ...body }) => requestData(() => api.PATCH("/template-instances/{id}", { params: { path: { id } }, body, headers: companyHeader(companyId) })),
    onSuccess: () => invalidate(),
  });
}

/** Renders the instance to an image in storage; `outputUrl` becomes available on the returned instance. */
export function useRenderInstance(companyId?: string | null) {
  const invalidate = useInvalidateInstances();
  return useMutation<TemplateInstance, ApiError, string>({
    mutationFn: (id) => requestData(() => api.POST("/template-instances/{id}/render", { params: { path: { id } }, headers: companyHeader(companyId) })),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteInstance(companyId?: string | null) {
  const invalidate = useInvalidateInstances();
  return useMutation<void, ApiError, string>({
    mutationFn: async (id) => { await request(() => api.DELETE("/template-instances/{id}", { params: { path: { id } }, headers: companyHeader(companyId) })); },
    onSuccess: () => invalidate(),
  });
}

export function usePublishInstance(companyId?: string | null) {
  const qc = useQueryClient();
  return useMutation<PublishResult, ApiError, { id: string; screenIds: string[]; groupIds: string[] }>({
    mutationFn: ({ id, ...body }) => requestData(() => api.POST("/template-instances/{id}/publish", { params: { path: { id }, header: idempotencyKey() }, body, headers: companyHeader(companyId) })),
    onSuccess: () => Promise.all([keys.instances, keys.screens, keys.groups].map((k) => qc.invalidateQueries({ queryKey: k }))),
  });
}
