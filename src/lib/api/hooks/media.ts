"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { putWithProgress, readMediaMetadata } from "@/lib/upload";
import { api, ApiError, companyHeader, request, requestData, requestPage } from "../client";
import { clean, keys } from "../query";
import type { Media, Page, Schemas } from "../types";
import type { ScopeOpts } from "./screens";

export interface MediaFilters { search?: string; type?: Media["type"]; status?: Media["status"]; page?: number; pageSize?: number }

export function useMedia(filters: MediaFilters = {}, opts: ScopeOpts = {}) {
  const query = clean(filters);
  return useQuery<Page<Media>, ApiError>({
    queryKey: [...keys.media, opts.companyId ?? "own", query],
    queryFn: () => requestPage(() => api.GET("/media", { params: { query }, headers: companyHeader(opts.companyId) })),
    enabled: opts.enabled ?? true,
  });
}

export function useMediaItem(id: string, opts: ScopeOpts = {}) {
  return useQuery<Media, ApiError>({
    queryKey: [...keys.media, "detail", id],
    queryFn: () => requestData(() => api.GET("/media/{id}", { params: { path: { id } }, headers: companyHeader(opts.companyId) })),
    enabled: (opts.enabled ?? true) && !!id,
  });
}

function useInvalidateMedia() {
  const qc = useQueryClient();
  return () => Promise.all([keys.media, keys.playlists].map((k) => qc.invalidateQueries({ queryKey: k })));
}

export function useUpdateMedia(companyId?: string | null) {
  const invalidate = useInvalidateMedia();
  return useMutation<Media, ApiError, { id: string } & Schemas["UpdateMediaBody"]>({
    mutationFn: ({ id, ...body }) => requestData(() => api.PATCH("/media/{id}", { params: { path: { id } }, body, headers: companyHeader(companyId) })),
    onSuccess: () => invalidate(),
  });
}

/** `force` removes the asset from playlists that use it; without it the API answers MEDIA_IN_USE. */
export function useDeleteMedia(companyId?: string | null) {
  const invalidate = useInvalidateMedia();
  return useMutation<void, ApiError, { id: string; force?: boolean }>({
    mutationFn: async ({ id, force }) => { await request(() => api.DELETE("/media/{id}", { params: { path: { id }, query: force ? { force: true } : {} }, headers: companyHeader(companyId) })); },
    onSuccess: () => invalidate(),
  });
}

export function useRetryMedia(companyId?: string | null) {
  const invalidate = useInvalidateMedia();
  return useMutation<Media, ApiError, string>({
    mutationFn: (id) => requestData(() => api.POST("/media/{id}/retry", { params: { path: { id } }, headers: companyHeader(companyId) })),
    onSuccess: () => invalidate(),
  });
}

export function useDownloadUrl(companyId?: string | null) {
  return useMutation<{ url: string; expiresInSec: number }, ApiError, string>({
    mutationFn: (id) => requestData(() => api.GET("/media/{id}/download-url", { params: { path: { id } }, headers: companyHeader(companyId) })) as Promise<{ url: string; expiresInSec: number }>,
  });
}

/**
 * Three-step upload: ask the API for a presigned URL, PUT the bytes straight to storage,
 * then finalize so the API verifies the object and queues conversion.
 */
export function useUpload(companyId?: string | null) {
  const invalidate = useInvalidateMedia();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(async (file: File, tags: string[] = []): Promise<Media> => {
    setUploading(true);
    setProgress((p) => ({ ...p, [file.name]: 0 }));
    try {
      const meta = await readMediaMetadata(file);
      const { asset, uploadUrl } = await requestData(() => api.POST("/media/upload-url", { body: { fileName: file.name, contentType: file.type as Schemas["UploadUrlBody"]["contentType"], sizeBytes: file.size, tags }, headers: companyHeader(companyId) }));
      await putWithProgress(uploadUrl, file, (pct) => setProgress((p) => ({ ...p, [file.name]: pct })));
      const done = await requestData(() => api.POST("/media/{id}/finalize", { params: { path: { id: asset.id } }, body: meta, headers: companyHeader(companyId) }));
      await invalidate();
      return done;
    } finally {
      setUploading(false);
    }
  }, [companyId, invalidate]);

  return { upload, progress, uploading };
}

export const mediaTypeLabel = (t: Media["type"]) => (t === "IMAGE" ? "JPG/PNG" : t === "VIDEO" ? "MP4" : "PDF");
export const MEDIA_TYPES: Media["type"][] = ["IMAGE", "VIDEO", "PDF"];
