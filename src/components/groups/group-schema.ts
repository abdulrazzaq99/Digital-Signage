/** Screen group form rules (admin modal and portal page). Limits mirror the API's `createGroupBody`. */
import type { Schemas, ScreenGroup } from "@/lib/api/types";
import { optionalText, text } from "@/lib/validation/fields";
import { z } from "zod";

export const GROUP_NAME_MAX = 120;
/** The API caps group descriptions at 300 characters. */
export const GROUP_DESCRIPTION_MAX = 300;

export const groupSchema = z.object({ name: text(GROUP_NAME_MAX, 2), description: optionalText(GROUP_DESCRIPTION_MAX) });
export type GroupFormValues = z.output<typeof groupSchema>;

export const groupDefaults = (g?: ScreenGroup) => ({ name: g?.name ?? "", description: g?.description ?? "" });

export function toCreateGroupBody(v: GroupFormValues, screenIds: string[]): Schemas["CreateGroupBody"] {
  return { name: v.name, screenIds, ...(v.description ? { description: v.description } : {}) };
}

/** A cleared description is sent as `null` (the API's clear value); an unchanged one is left out. */
export function toUpdateGroupBody(g: ScreenGroup, v: GroupFormValues, screenIds: string[]): Schemas["UpdateGroupBody"] {
  const body: Schemas["UpdateGroupBody"] = { screenIds };
  if (v.name !== g.name) body.name = v.name;
  if (v.description !== (g.description ?? "")) body.description = v.description || null;
  return body;
}
