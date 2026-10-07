"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { putWithProgress, readMediaMetadata } from "@/lib/upload";
import { api, ApiError, request, requestData } from "../client";
import { keys } from "../query";
import type { Broadcast, Schemas } from "../types";

/** Head Office pushes, newest first (Super Admin only). Refreshed every minute so statuses follow the clock. */
export function useBroadcasts() {
  return useQuery<Broadcast[], ApiError>({ queryKey: keys.broadcasts, queryFn: () => requestData(() => api.GET("/broadcasts")), refetchInterval: 60_000 });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: keys.broadcasts });
}

/** Uploads a picture or MP4 for a push; resolves to the body fields the create call needs. */
export function useUploadBroadcastFile() {
  return useMutation<{ fileKey: string; videoSec?: number; width?: number; height?: number }, ApiError, { file: File; onProgress?: (pct: number) => void }>({
    mutationFn: async ({ file, onProgress }) => {
      const meta = await readMediaMetadata(file);
      const { key, uploadUrl } = await requestData(() => api.POST("/broadcasts/upload-url", { body: { fileName: file.name, contentType: file.type as Schemas["BroadcastUploadBody"]["contentType"], sizeBytes: file.size } }));
      await putWithProgress(uploadUrl, file, onProgress ?? (() => undefined));
      return { fileKey: key, ...(meta.durationSec ? { videoSec: meta.durationSec } : {}), ...(meta.width ? { width: meta.width } : {}), ...(meta.height ? { height: meta.height } : {}) };
    },
  });
}

export function useCreateBroadcast() {
  const invalidate = useInvalidate();
  return useMutation<Broadcast, ApiError, Schemas["CreateBroadcastBody"]>({
    mutationFn: (body) => requestData(() => api.POST("/broadcasts", { body })),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateBroadcast() {
  const invalidate = useInvalidate();
  return useMutation<Broadcast, ApiError, { id: string } & Schemas["UpdateBroadcastBody"]>({
    mutationFn: ({ id, ...body }) => requestData(() => api.PATCH("/broadcasts/{id}", { params: { path: { id } }, body })),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteBroadcast() {
  const invalidate = useInvalidate();
  return useMutation<void, ApiError, string>({
    mutationFn: async (id) => { await request(() => api.DELETE("/broadcasts/{id}", { params: { path: { id } } })); },
    onSuccess: () => invalidate(),
  });
}
