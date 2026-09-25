/**
 * File checks run the moment a file is added to the upload modal, so an unsupported or oversized
 * file is flagged on its own row before anything is sent. Mirrors the API's upload rules.
 */
import { formatBytes } from "@/lib/format";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES } from "@/lib/upload";
import { z } from "zod";
import { tagsText } from "@/lib/validation/fields";

/** Most files one batch can hold; keeps a drop of a whole folder from queueing hundreds of uploads. */
export const MAX_BATCH_FILES = 20;
/** The API stores the file name as the asset name (200 characters). */
export const MAX_FILE_NAME = 200;

export type FileLike = Pick<File, "name" | "size" | "type">;

/** Why this file can't be uploaded, or null when it can. */
export function fileProblem(file: FileLike): string | null {
  if (!ALLOWED_MIME[file.type]) return `${file.type ? `${file.type} files aren't` : "This file type isn't"} supported. Use JPG, PNG, MP4 or PDF.`;
  if (file.size <= 0) return "This file is empty.";
  if (file.size > MAX_UPLOAD_BYTES) return `This file is ${formatBytes(file.size)}. Files must be ${formatBytes(MAX_UPLOAD_BYTES)} or smaller.`;
  if (file.name.trim().length === 0) return "This file has no name.";
  if (file.name.length > MAX_FILE_NAME) return `File names must be at most ${MAX_FILE_NAME} characters.`;
  return null;
}

export const sameFile = (a: FileLike, b: FileLike) => a.name === b.name && a.size === b.size;

/**
 * Splits newly added files into ones to queue (each with its problem, if any) and a note about
 * what was skipped: duplicates of queued files, and anything past the batch cap.
 */
export function planAdd<T extends FileLike>(queued: T[], incoming: T[], max = MAX_BATCH_FILES): { add: { file: T; problem: string | null }[]; skipped: string | null } {
  const add: { file: T; problem: string | null }[] = [];
  let duplicates = 0;
  let overflow = 0;
  for (const f of incoming) {
    if ([...queued, ...add.map((a) => a.file)].some((q) => sameFile(q, f))) { duplicates++; continue; }
    if (queued.length + add.length >= max) { overflow++; continue; }
    add.push({ file: f, problem: fileProblem(f) });
  }
  const notes = [
    duplicates ? `${duplicates} duplicate file${duplicates === 1 ? " was" : "s were"} skipped` : "",
    overflow ? `${overflow} file${overflow === 1 ? " was" : "s were"} left out: upload at most ${max} files at a time` : "",
  ].filter(Boolean);
  return { add, skipped: notes.length ? `${notes.join("; ")}.` : null };
}

export const uploadTagsSchema = z.object({ tags: tagsText() });
