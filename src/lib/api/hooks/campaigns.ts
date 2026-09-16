"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, idempotencyKey, request, requestData, requestPage } from "../client";
import { clean, keys } from "../query";
import type { AttemptResult, Campaign, Eligibility, Page, Schemas, Winner } from "../types";

export interface CampaignFilters { status?: Campaign["status"]; search?: string; page?: number; pageSize?: number }

/** Campaigns are platform-run; customers see active ones and play, the Super Admin manages them. */
export function useCampaigns(filters: CampaignFilters = {}, opts: { enabled?: boolean } = {}) {
  const query = clean(filters);
  return useQuery<Page<Campaign>, ApiError>({ queryKey: [...keys.campaigns, query], queryFn: () => requestPage(() => api.GET("/campaigns", { params: { query } })), enabled: opts.enabled ?? true });
}

export function useCampaign(id: string) {
  return useQuery<Campaign, ApiError>({ queryKey: [...keys.campaigns, "detail", id], queryFn: () => requestData(() => api.GET("/campaigns/{id}", { params: { path: { id } } })), enabled: !!id });
}

export function useEligibility(id: string) {
  return useQuery<Eligibility, ApiError>({ queryKey: [...keys.campaigns, "eligibility", id], queryFn: () => requestData(() => api.GET("/campaigns/{id}/eligibility", { params: { path: { id } } })), enabled: !!id, staleTime: 0 });
}

function useInvalidateCampaigns() {
  const qc = useQueryClient();
  return () => Promise.all([keys.campaigns, keys.winners].map((k) => qc.invalidateQueries({ queryKey: k })));
}

export function useCreateCampaign() {
  const invalidate = useInvalidateCampaigns();
  return useMutation<Campaign, ApiError, Schemas["CreateCampaignBody"]>({ mutationFn: (body) => requestData(() => api.POST("/campaigns", { body })), onSuccess: () => invalidate() });
}

export function useUpdateCampaign() {
  const invalidate = useInvalidateCampaigns();
  return useMutation<Campaign, ApiError, { id: string } & Schemas["UpdateCampaignBody"]>({ mutationFn: ({ id, ...body }) => requestData(() => api.PATCH("/campaigns/{id}", { params: { path: { id } }, body })), onSuccess: () => invalidate() });
}

export function useActivateCampaign() {
  const invalidate = useInvalidateCampaigns();
  return useMutation<Campaign, ApiError, string>({ mutationFn: (id) => requestData(() => api.POST("/campaigns/{id}/activate", { params: { path: { id } } })), onSuccess: () => invalidate() });
}

export function useDeactivateCampaign() {
  const invalidate = useInvalidateCampaigns();
  return useMutation<Campaign, ApiError, string>({ mutationFn: (id) => requestData(() => api.POST("/campaigns/{id}/deactivate", { params: { path: { id } } })), onSuccess: () => invalidate() });
}

export function useAddPrize() {
  const invalidate = useInvalidateCampaigns();
  return useMutation<Campaign, ApiError, { id: string } & Schemas["AddPrizeBody"]>({ mutationFn: ({ id, ...body }) => requestData(() => api.POST("/campaigns/{id}/prizes", { params: { path: { id } }, body })), onSuccess: () => invalidate() });
}

export function useDeletePrize() {
  const invalidate = useInvalidateCampaigns();
  return useMutation<void, ApiError, { id: string; prizeId: string }>({ mutationFn: async ({ id, prizeId }) => { await request(() => api.DELETE("/campaigns/{id}/prizes/{prizeId}", { params: { path: { id, prizeId } } })); }, onSuccess: () => invalidate() });
}

/** One scratch attempt. The API decides the outcome atomically; the key makes retries safe. */
export function useAttempt(id: string) {
  const invalidate = useInvalidateCampaigns();
  return useMutation<AttemptResult, ApiError, void>({ mutationFn: () => requestData(() => api.POST("/campaigns/{id}/attempts", { params: { path: { id }, header: idempotencyKey() } })), onSuccess: () => invalidate() });
}

export interface WinnerFilters { campaignId?: string; companyId?: string; redemption?: "PENDING" | "REDEEMED"; search?: string; page?: number; pageSize?: number }

export function useWinners(filters: WinnerFilters = {}, opts: { enabled?: boolean } = {}) {
  const query = clean(filters);
  return useQuery<Page<Winner>, ApiError>({ queryKey: [...keys.winners, query], queryFn: () => requestPage(() => api.GET("/winners", { params: { query } })), enabled: opts.enabled ?? true });
}

export function useRedeemWinner() {
  const invalidate = useInvalidateCampaigns();
  return useMutation<Winner, ApiError, string>({ mutationFn: (id) => requestData(() => api.POST("/winners/{id}/redeem", { params: { path: { id } } })), onSuccess: () => invalidate() });
}

export const CAMPAIGN_STATUSES: Campaign["status"][] = ["DRAFT", "SCHEDULED", "ACTIVE", "ENDED", "INACTIVE"];
export const campaignTone = (s: Campaign["status"]): "green" | "blue" | "slate" | "red" | "amber" => (s === "ACTIVE" ? "green" : s === "SCHEDULED" ? "blue" : s === "DRAFT" ? "slate" : s === "ENDED" ? "red" : "amber");
