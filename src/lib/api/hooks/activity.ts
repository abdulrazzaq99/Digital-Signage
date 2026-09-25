"use client";
import { useQuery } from "@tanstack/react-query";
import { api, ApiError, requestPage } from "../client";
import { clean, keys } from "../query";
import type { paths } from "../schema";
import type { ActivityEntry, Page } from "../types";

export interface ActivityFilters { action?: string; resourceType?: NonNullable<paths["/activity"]["get"]["parameters"]["query"]>["resourceType"]; status?: "SUCCESS" | "PENDING" | "FAILED"; companyId?: string; from?: string; to?: string; search?: string; page?: number; pageSize?: number }

export function useActivity(filters: ActivityFilters = {}, opts: { enabled?: boolean } = {}) {
  const query = clean(filters);
  return useQuery<Page<ActivityEntry>, ApiError>({
    queryKey: [...keys.activity, query],
    queryFn: () => requestPage(() => api.GET("/activity", { params: { query } })),
    enabled: opts.enabled ?? true,
  });
}
