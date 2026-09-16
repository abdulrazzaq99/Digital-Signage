"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, companyHeader, request, requestData, requestPage } from "../client";
import { clean, keys } from "../query";
import type { Page, Schemas, User } from "../types";
import type { ScopeOpts } from "./screens";

export interface UserFilters { search?: string; page?: number; pageSize?: number }

export function useUsers(filters: UserFilters = {}, opts: ScopeOpts = {}) {
  const query = clean(filters);
  return useQuery<Page<User>, ApiError>({
    queryKey: [...keys.users, opts.companyId ?? "own", query],
    queryFn: () => requestPage(() => api.GET("/users", { params: { query }, headers: companyHeader(opts.companyId) })),
    enabled: opts.enabled ?? true,
  });
}

function useInvalidateUsers() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: keys.users });
}

export function useCreateUser(companyId?: string | null) {
  const invalidate = useInvalidateUsers();
  return useMutation<User, ApiError, Schemas["CreateUserBody"]>({ mutationFn: (body) => requestData(() => api.POST("/users", { body, headers: companyHeader(companyId) })), onSuccess: () => invalidate() });
}

export function useUpdateUser(companyId?: string | null) {
  const invalidate = useInvalidateUsers();
  return useMutation<User, ApiError, { id: string } & Schemas["UpdateUserBody"]>({ mutationFn: ({ id, ...body }) => requestData(() => api.PATCH("/users/{id}", { params: { path: { id } }, body, headers: companyHeader(companyId) })), onSuccess: () => invalidate() });
}

export function useDeleteUser(companyId?: string | null) {
  const invalidate = useInvalidateUsers();
  return useMutation<void, ApiError, string>({ mutationFn: async (id) => { await request(() => api.DELETE("/users/{id}", { params: { path: { id } }, headers: companyHeader(companyId) })); }, onSuccess: () => invalidate() });
}

export const COMPANY_ROLES: NonNullable<User["role"]>[] = ["ADMIN", "EDITOR", "VIEWER"];
