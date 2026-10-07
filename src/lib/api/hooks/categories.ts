"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, request, requestData } from "../client";
import { keys } from "../query";
import type { LocationCategory } from "../types";

/** Location categories (Kiosk, Restaurant, ...), each with how many locations are in it. */
export function useCategories() {
  return useQuery<LocationCategory[], ApiError>({
    queryKey: keys.categories,
    queryFn: () => requestData(() => api.GET("/categories")),
    staleTime: 60_000,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => Promise.all([keys.categories, keys.companies].map((k) => qc.invalidateQueries({ queryKey: k })));
}

export function useCreateCategory() {
  const invalidate = useInvalidate();
  return useMutation<LocationCategory, ApiError, string>({
    mutationFn: (name) => requestData(() => api.POST("/categories", { body: { name } })),
    onSuccess: () => invalidate(),
  });
}

export function useRenameCategory() {
  const invalidate = useInvalidate();
  return useMutation<LocationCategory, ApiError, { id: string; name: string }>({
    mutationFn: ({ id, name }) => requestData(() => api.PATCH("/categories/{id}", { params: { path: { id } }, body: { name } })),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidate();
  return useMutation<void, ApiError, string>({
    mutationFn: async (id) => { await request(() => api.DELETE("/categories/{id}", { params: { path: { id } } })); },
    onSuccess: () => invalidate(),
  });
}
