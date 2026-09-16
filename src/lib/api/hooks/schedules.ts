"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, companyHeader, idempotencyKey, request, requestData, requestPage } from "../client";
import { clean, keys } from "../query";
import type { ActiveAssignment, Page, Schedule, Schemas } from "../types";
import type { ScopeOpts } from "./screens";

export interface ScheduleFilters { targetKind?: "SCREEN" | "GROUP"; targetId?: string; playlistId?: string; activeOnly?: boolean; page?: number; pageSize?: number }

export function useSchedules(filters: ScheduleFilters = {}, opts: ScopeOpts = {}) {
  const query = clean(filters);
  return useQuery<Page<Schedule>, ApiError>({
    queryKey: [...keys.schedules, opts.companyId ?? "own", query],
    queryFn: () => requestPage(() => api.GET("/schedules", { params: { query }, headers: companyHeader(opts.companyId) })),
    enabled: opts.enabled ?? true,
  });
}

/** What a screen should be showing right now, resolved by schedule precedence. */
export function useActiveAssignment(screenId: string, opts: ScopeOpts = {}) {
  return useQuery<ActiveAssignment, ApiError>({
    queryKey: [...keys.schedules, "active", screenId],
    queryFn: () => requestData(() => api.GET("/schedules/active", { params: { query: { screenId } }, headers: companyHeader(opts.companyId) })),
    enabled: (opts.enabled ?? true) && !!screenId,
  });
}

function useInvalidateSchedules() {
  const qc = useQueryClient();
  return () => Promise.all([keys.schedules, keys.screens].map((k) => qc.invalidateQueries({ queryKey: k })));
}

export function useCheckConflicts(companyId?: string | null) {
  return useMutation<Schemas["ScheduleConflicts"], ApiError, Schemas["CheckConflictsBody"]>({
    mutationFn: (body) => requestData(() => api.POST("/schedules/check-conflicts", { body, headers: companyHeader(companyId) })),
  });
}

export function useCreateSchedule(companyId?: string | null) {
  const invalidate = useInvalidateSchedules();
  return useMutation<Schedule, ApiError, Schemas["CreateScheduleBody"]>({
    mutationFn: (body) => requestData(() => api.POST("/schedules", { params: { header: idempotencyKey() }, body, headers: companyHeader(companyId) })),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateSchedule(companyId?: string | null) {
  const invalidate = useInvalidateSchedules();
  return useMutation<Schedule, ApiError, { id: string } & Schemas["UpdateScheduleBody"]>({
    mutationFn: ({ id, ...body }) => requestData(() => api.PATCH("/schedules/{id}", { params: { path: { id } }, body, headers: companyHeader(companyId) })),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteSchedule(companyId?: string | null) {
  const invalidate = useInvalidateSchedules();
  return useMutation<void, ApiError, string>({
    mutationFn: async (id) => { await request(() => api.DELETE("/schedules/{id}", { params: { path: { id } }, headers: companyHeader(companyId) })); },
    onSuccess: () => invalidate(),
  });
}
