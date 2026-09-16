"use client";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";
import { api, ApiError, request, requestData } from "../client";
import type { Schemas } from "../types";

export { useAuth };

export function useForgotPassword() {
  return useMutation<void, ApiError, { email: string }>({ mutationFn: async (body) => { await request(() => api.POST("/auth/forgot-password", { body })); } });
}

export function useChangePassword() {
  return useMutation<void, ApiError, Schemas["ChangePasswordBody"]>({ mutationFn: async (body) => { await request(() => api.POST("/auth/change-password", { body })); } });
}

export function useUpdateProfile() {
  const { refreshUser } = useAuth();
  return useMutation<Schemas["User"], ApiError, Schemas["UpdateProfileBody"]>({
    mutationFn: (body) => requestData(() => api.PATCH("/users/me", { body })),
    onSuccess: () => refreshUser(),
  });
}
