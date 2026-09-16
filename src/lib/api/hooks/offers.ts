"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, request, requestData, requestPage } from "../client";
import { clean, keys } from "../query";
import type { Offer, Page, Schemas } from "../types";

export interface OfferFilters { search?: string; status?: Offer["status"]; category?: string; page?: number; pageSize?: number }

/** Offers are platform content: the Super Admin writes them, every company reads the published ones. */
export function useOffers(filters: OfferFilters = {}, opts: { enabled?: boolean } = {}) {
  const query = clean(filters);
  return useQuery<Page<Offer>, ApiError>({
    queryKey: [...keys.offers, query],
    queryFn: () => requestPage(() => api.GET("/offers", { params: { query } })),
    enabled: opts.enabled ?? true,
  });
}

export function useOffer(id: string) {
  return useQuery<Offer, ApiError>({
    queryKey: [...keys.offers, "detail", id],
    queryFn: () => requestData(() => api.GET("/offers/{id}", { params: { path: { id } } })),
    enabled: !!id,
  });
}

export interface OfferStats { totalViews: number; uniqueViewers: number; lastViewedAt: string | null; byCompany: { companyId: string | null; views: number }[] }

export function useOfferStats(id: string) {
  return useQuery<OfferStats, ApiError>({
    queryKey: [...keys.offers, "stats", id],
    queryFn: () => requestData(() => api.GET("/offers/{id}/stats", { params: { path: { id } } })) as Promise<OfferStats>,
    enabled: !!id,
  });
}

function useInvalidateOffers() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: keys.offers });
}

export function useCreateOffer() {
  const invalidate = useInvalidateOffers();
  return useMutation<Offer, ApiError, Schemas["CreateOfferBody"]>({ mutationFn: (body) => requestData(() => api.POST("/offers", { body })), onSuccess: () => invalidate() });
}

export function useUpdateOffer() {
  const invalidate = useInvalidateOffers();
  return useMutation<Offer, ApiError, { id: string } & Schemas["UpdateOfferBody"]>({ mutationFn: ({ id, ...body }) => requestData(() => api.PATCH("/offers/{id}", { params: { path: { id } }, body })), onSuccess: () => invalidate() });
}

export function useDeleteOffer() {
  const invalidate = useInvalidateOffers();
  return useMutation<void, ApiError, string>({ mutationFn: async (id) => { await request(() => api.DELETE("/offers/{id}", { params: { path: { id } } })); }, onSuccess: () => invalidate() });
}

export function usePublishOffer() {
  const invalidate = useInvalidateOffers();
  return useMutation<Offer, ApiError, string>({ mutationFn: (id) => requestData(() => api.POST("/offers/{id}/publish", { params: { path: { id } } })), onSuccess: () => invalidate() });
}

export function useUnpublishOffer() {
  const invalidate = useInvalidateOffers();
  return useMutation<Offer, ApiError, string>({ mutationFn: (id) => requestData(() => api.POST("/offers/{id}/unpublish", { params: { path: { id } } })), onSuccess: () => invalidate() });
}

/** Records a customer view (counted once per user per 30-minute window by the API). Fire-and-forget. */
export function useRecordOfferView() {
  return useMutation<void, ApiError, string>({ mutationFn: async (id) => { await request(() => api.POST("/offers/{id}/view", { params: { path: { id } } })); } });
}

export const OFFER_STATUSES: Offer["status"][] = ["DRAFT", "PUBLISHED", "UNPUBLISHED", "EXPIRED"];
export const offerTone = (s: Offer["status"]): "green" | "slate" | "amber" | "red" => (s === "PUBLISHED" ? "green" : s === "DRAFT" ? "slate" : s === "UNPUBLISHED" ? "amber" : "red");
export const categoryTone = (c: string): "blue" | "purple" | "green" | "amber" | "red" | "slate" => { const k = c.toLowerCase(); return k.includes("hard") || k.includes("tech") ? "blue" : k.includes("soft") ? "purple" : k.includes("serv") || k.includes("well") ? "green" : k.includes("support") || k.includes("food") ? "amber" : k.includes("retail") ? "red" : "slate"; };
/** True when the offer ends within the next seven days. */
export const endingSoon = (o: Offer) => !!o.endsAt && new Date(o.endsAt).getTime() - Date.now() < 7 * 86_400_000 && new Date(o.endsAt).getTime() > Date.now();
