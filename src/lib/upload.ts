import { ApiError } from "./api/client";
import type { Media } from "./api/types";

/** Mirrors ALLOWED_MIME in the API (src/config/constants.ts). Checked client-side for an immediate message. */
export const ALLOWED_MIME: Record<string, Media["type"]> = { "image/jpeg": "IMAGE", "image/png": "IMAGE", "video/mp4": "VIDEO", "application/pdf": "PDF" };
export const ACCEPT = Object.keys(ALLOWED_MIME).join(",");
export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;

export interface MediaMetadata { width?: number; height?: number; durationSec?: number }

/** Reads dimensions and duration in the browser so the API can store them on finalize. */
export function readMediaMetadata(file: File): Promise<MediaMetadata> {
  const kind = ALLOWED_MIME[file.type];
  if (!kind) return Promise.reject(new ApiError(400, "UNSUPPORTED_TYPE", `${file.type || "This file type"} isn't supported. Use JPG, PNG, MP4, or PDF.`));
  if (file.size > MAX_UPLOAD_BYTES) return Promise.reject(new ApiError(400, "FILE_TOO_LARGE", "Files must be 500 MB or smaller."));
  if (kind === "IMAGE") {
    return createImageBitmap(file).then((b) => { const m = { width: b.width, height: b.height }; b.close(); return m; }).catch(() => ({}));
  }
  if (kind === "VIDEO") {
    return new Promise<MediaMetadata>((resolve) => {
      const v = document.createElement("video");
      v.preload = "metadata";
      const url = URL.createObjectURL(file);
      v.onloadedmetadata = () => { resolve({ width: v.videoWidth || undefined, height: v.videoHeight || undefined, durationSec: Number.isFinite(v.duration) ? Math.max(1, Math.round(v.duration)) : undefined }); URL.revokeObjectURL(url); };
      v.onerror = () => { resolve({}); URL.revokeObjectURL(url); };
      v.src = url;
    });
  }
  return Promise.resolve({});
}

/** Direct-to-storage PUT with upload progress (fetch has no progress events). */
export function putWithProgress(url: string, file: File, onProgress: (pct: number) => void): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new ApiError(xhr.status, "UPLOAD_FAILED", `Storage rejected the upload (${xhr.status}).`)));
    xhr.onerror = () => reject(new ApiError(0, "NETWORK", "Upload failed. Is the storage endpoint reachable from your browser?"));
    xhr.send(file);
  });
}
