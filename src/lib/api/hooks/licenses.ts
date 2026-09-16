"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, requestData, requestPage } from "../client";
import { keys } from "../query";
import type { License, Page, Schemas } from "../types";

/** Platform-wide licence list (Super Admin). */
export function useLicenses() {
  return useQuery<Page<License>, ApiError>({ queryKey: [...keys.licenses], queryFn: () => requestPage(() => api.GET("/licenses")) });
}

/** A company's licence; customers read their own, the Super Admin any. */
export function useLicense(companyId: string, opts: { enabled?: boolean } = {}) {
  return useQuery<License, ApiError>({
    queryKey: [...keys.licenses, "detail", companyId],
    queryFn: () => requestData(() => api.GET("/companies/{companyId}/license", { params: { path: { companyId } } })),
    enabled: (opts.enabled ?? true) && !!companyId,
  });
}

export function useUpdateLicense() {
  const qc = useQueryClient();
  return useMutation<License, ApiError, { companyId: string } & Schemas["UpdateLicenseBody"]>({
    mutationFn: ({ companyId, ...body }) => requestData(() => api.PUT("/companies/{companyId}/license", { params: { path: { companyId } }, body })),
    onSuccess: () => Promise.all([keys.licenses, keys.companies].map((k) => qc.invalidateQueries({ queryKey: k }))),
  });
}

export const LICENSE_STATES: License["state"][] = ["ACTIVE", "SUSPENDED", "DISABLED", "EXPIRED"];
