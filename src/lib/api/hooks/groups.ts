"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, companyHeader, request, requestData, requestPage } from "../client";
import { keys } from "../query";
import type { Page, Schemas, ScreenGroup } from "../types";
import type { ScopeOpts } from "./screens";

export function useGroups(opts: ScopeOpts = {}) {
  return useQuery<Page<ScreenGroup>, ApiError>({
    queryKey: [...keys.groups, opts.companyId ?? "own"],
    queryFn: () => requestPage(() => api.GET("/screen-groups", { headers: companyHeader(opts.companyId) })),
    enabled: opts.enabled ?? true,
  });
}

export function useGroup(id: string, opts: ScopeOpts = {}) {
  return useQuery<ScreenGroup, ApiError>({
    queryKey: [...keys.groups, "detail", id],
    queryFn: () => requestData(() => api.GET("/screen-groups/{id}", { params: { path: { id } }, headers: companyHeader(opts.companyId) })),
    enabled: (opts.enabled ?? true) && !!id,
  });
}

function useInvalidateGroups() {
  const qc = useQueryClient();
  return () => Promise.all([keys.groups, keys.screens].map((k) => qc.invalidateQueries({ queryKey: k })));
}

export function useCreateGroup(companyId?: string | null) {
  const invalidate = useInvalidateGroups();
  return useMutation<ScreenGroup, ApiError, Schemas["CreateGroupBody"]>({
    mutationFn: (body) => requestData(() => api.POST("/screen-groups", { body, headers: companyHeader(companyId) })),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateGroup(id: string, companyId?: string | null) {
  const invalidate = useInvalidateGroups();
  return useMutation<ScreenGroup, ApiError, Schemas["UpdateGroupBody"]>({
    mutationFn: (body) => requestData(() => api.PATCH("/screen-groups/{id}", { params: { path: { id } }, body, headers: companyHeader(companyId) })),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteGroup(companyId?: string | null) {
  const invalidate = useInvalidateGroups();
  return useMutation<void, ApiError, string>({
    mutationFn: async (id) => { await request(() => api.DELETE("/screen-groups/{id}", { params: { path: { id } }, headers: companyHeader(companyId) })); },
    onSuccess: () => invalidate(),
  });
}
