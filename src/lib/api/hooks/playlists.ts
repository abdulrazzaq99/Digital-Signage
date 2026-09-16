"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, companyHeader, idempotencyKey, request, requestData, requestPage } from "../client";
import { clean, keys } from "../query";
import type { Page, Playlist, PublishResult, Schemas } from "../types";
import type { ScopeOpts } from "./screens";

export interface PlaylistFilters { search?: string; status?: "DRAFT" | "PUBLISHED"; page?: number; pageSize?: number }

export function usePlaylists(filters: PlaylistFilters = {}, opts: ScopeOpts = {}) {
  const query = clean(filters);
  return useQuery<Page<Playlist>, ApiError>({
    queryKey: [...keys.playlists, opts.companyId ?? "own", query],
    queryFn: () => requestPage(() => api.GET("/playlists", { params: { query }, headers: companyHeader(opts.companyId) })),
    enabled: opts.enabled ?? true,
  });
}

export function usePlaylist(id: string, opts: ScopeOpts = {}) {
  return useQuery<Playlist, ApiError>({
    queryKey: [...keys.playlists, "detail", id],
    queryFn: () => requestData(() => api.GET("/playlists/{id}", { params: { path: { id } }, headers: companyHeader(opts.companyId) })),
    enabled: (opts.enabled ?? true) && !!id,
  });
}

function useInvalidatePlaylists() {
  const qc = useQueryClient();
  return () => Promise.all([keys.playlists, keys.media].map((k) => qc.invalidateQueries({ queryKey: k })));
}

export function useCreatePlaylist(companyId?: string | null) {
  const invalidate = useInvalidatePlaylists();
  return useMutation<Playlist, ApiError, Schemas["CreatePlaylistBody"]>({
    mutationFn: (body) => requestData(() => api.POST("/playlists", { body, headers: companyHeader(companyId) })),
    onSuccess: () => invalidate(),
  });
}

export function useUpdatePlaylist(id: string, companyId?: string | null) {
  const invalidate = useInvalidatePlaylists();
  return useMutation<Playlist, ApiError, Schemas["UpdatePlaylistBody"]>({
    mutationFn: (body) => requestData(() => api.PATCH("/playlists/{id}", { params: { path: { id } }, body, headers: companyHeader(companyId) })),
    onSuccess: () => invalidate(),
  });
}

export function useDeletePlaylist(companyId?: string | null) {
  const invalidate = useInvalidatePlaylists();
  return useMutation<void, ApiError, string>({
    mutationFn: async (id) => { await request(() => api.DELETE("/playlists/{id}", { params: { path: { id } }, headers: companyHeader(companyId) })); },
    onSuccess: () => invalidate(),
  });
}

export function useDuplicatePlaylist(companyId?: string | null) {
  const invalidate = useInvalidatePlaylists();
  return useMutation<Playlist, ApiError, string>({
    mutationFn: (id) => requestData(() => api.POST("/playlists/{id}/duplicate", { params: { path: { id } }, headers: companyHeader(companyId) })),
    onSuccess: () => invalidate(),
  });
}

/** Publishing rewrites screen assignments, so screens and groups are refreshed as well. */
export function usePublishPlaylist(companyId?: string | null) {
  const qc = useQueryClient();
  return useMutation<PublishResult, ApiError, { id: string } & Schemas["PublishPlaylistBody"]>({
    mutationFn: ({ id, ...body }) => requestData(() => api.POST("/playlists/{id}/publish", { params: { path: { id }, header: idempotencyKey() }, body, headers: companyHeader(companyId) })),
    onSuccess: () => Promise.all([keys.playlists, keys.screens, keys.groups].map((k) => qc.invalidateQueries({ queryKey: k }))),
  });
}
