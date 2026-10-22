"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, requestData, requestPage } from "../client";
import { clean, keys } from "../query";
import type { InboxNotification, Notification, Page, Schemas } from "../types";

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

/** Notifications sent to the signed-in user: to everyone, their company's category, their company, or them. Rechecked every minute. */
export function useInbox(opts: { enabled?: boolean } = {}) {
  return useQuery<Page<InboxNotification>, ApiError>({
    queryKey: [...keys.notifications, "inbox"],
    queryFn: () => requestPage(() => api.GET("/notifications/inbox", { params: { query: { pageSize: 20 } } })),
    enabled: opts.enabled ?? true,
    refetchInterval: 60_000,
  });
}
