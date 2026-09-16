"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, requestData, requestPage } from "../client";
import { clean, keys } from "../query";
import type { Notification, Page, Schemas } from "../types";

/** Push notifications sent by the Super Admin (delivered through the push provider). */
export function useNotifications(filters: { page?: number; pageSize?: number } = {}) {
  const query = clean(filters);
  return useQuery<Page<Notification>, ApiError>({ queryKey: [...keys.notifications, query], queryFn: () => requestPage(() => api.GET("/notifications", { params: { query } })) });
}

export function useSendNotification() {
  const qc = useQueryClient();
  return useMutation<Notification, ApiError, Schemas["CreateNotificationBody"]>({
    mutationFn: (body) => requestData(() => api.POST("/notifications", { body })),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.notifications }),
  });
}
