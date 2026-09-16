"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, companyHeader, request, requestData, requestPage } from "../client";
import { clean, keys } from "../query";
import type { Page, Schemas, Screen } from "../types";

export interface ScreenFilters { search?: string; status?: Screen["status"]; groupId?: string; orientation?: Screen["orientation"]; page?: number; pageSize?: number }
export interface ScopeOpts { companyId?: string | null; enabled?: boolean }

export function useScreens(filters: ScreenFilters = {}, opts: ScopeOpts = {}) {
  const query = clean(filters);
  return useQuery<Page<Screen>, ApiError>({
    queryKey: [...keys.screens, opts.companyId ?? "own", query],
    queryFn: () => requestPage(() => api.GET("/screens", { params: { query }, headers: companyHeader(opts.companyId) })),
    enabled: opts.enabled ?? true,
  });
}

export function useScreen(id: string, opts: ScopeOpts = {}) {
  return useQuery<Screen, ApiError>({
    queryKey: [...keys.screens, "detail", id],
    queryFn: () => requestData(() => api.GET("/screens/{id}", { params: { path: { id } }, headers: companyHeader(opts.companyId) })),
    enabled: (opts.enabled ?? true) && !!id,
  });
}

/** Screen changes ripple into groups, licence usage, and company counts. */
export function useInvalidateScreens() {
  const qc = useQueryClient();
  return () => Promise.all([keys.screens, keys.groups, keys.licenses, keys.companies].map((k) => qc.invalidateQueries({ queryKey: k })));
}

export function usePairScreen(companyId?: string | null) {
  const invalidate = useInvalidateScreens();
  return useMutation<Screen, ApiError, Schemas["PairScreenBody"]>({
    mutationFn: (body) => requestData(() => api.POST("/screens/pair", { body, headers: companyHeader(companyId) })),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateScreen(id: string, companyId?: string | null) {
  const invalidate = useInvalidateScreens();
  return useMutation<Screen, ApiError, Schemas["UpdateScreenBody"]>({
    mutationFn: (body) => requestData(() => api.PATCH("/screens/{id}", { params: { path: { id } }, body, headers: companyHeader(companyId) })),
    onSuccess: () => invalidate(),
  });
}

export function useUnpairScreen(companyId?: string | null) {
  const invalidate = useInvalidateScreens();
  return useMutation<void, ApiError, string>({
    mutationFn: async (id) => { await request(() => api.POST("/screens/{id}/unpair", { params: { path: { id } }, headers: companyHeader(companyId) })); },
    onSuccess: () => invalidate(),
  });
}

export function useScreenCommand(companyId?: string | null) {
  return useMutation<void, ApiError, { id: string; command: Schemas["RemoteCommandBody"]["command"] }>({
    mutationFn: async ({ id, command }) => { await request(() => api.POST("/screens/{id}/commands", { params: { path: { id } }, body: { command }, headers: companyHeader(companyId) })); },
  });
}

export const screenStatusLabel = (s: Screen["status"]): "Online" | "Offline" | "Error" => (s === "ONLINE" ? "Online" : s === "OFFLINE" ? "Offline" : "Error");
export const SCREEN_STATUSES: Screen["status"][] = ["ONLINE", "OFFLINE", "ERROR"];
