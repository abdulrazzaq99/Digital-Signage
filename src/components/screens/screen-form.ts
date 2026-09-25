/**
 * Screen form rules, shared by the Super Admin pairing modal, the portal pairing flow and the portal
 * screen editor. Limits mirror the API (`screens.schemas.ts`); bodies only carry what the API accepts.
 */
import { ApiError } from "@/lib/api/client";
import type { Schemas, Screen } from "@/lib/api/types";
import { optionalText, pairingCode, parseTags, tagsText, text } from "@/lib/validation/fields";
import { z } from "zod";

export const SCREEN_NAME_MAX = 120;
export const SCREEN_LOCATION_MAX = 120;

export const pairCodeSchema = z.object({ code: pairingCode() });

export const screenSchema = z.object({
  name: text(SCREEN_NAME_MAX, 2),
  location: optionalText(SCREEN_LOCATION_MAX),
  groupId: z.string(),
  orientation: z.enum(["LANDSCAPE", "PORTRAIT"]),
  tags: tagsText(),
});
export type ScreenFormInput = z.input<typeof screenSchema>;
export type ScreenFormValues = z.output<typeof screenSchema>;

export const emptyScreenForm = (): ScreenFormInput => ({ name: "", location: "", groupId: "", orientation: "LANDSCAPE", tags: "" });

/** Pair body: blank optional fields are left out, never sent as "". */
export function toPairBody(code: string, v: ScreenFormValues): Schemas["PairScreenBody"] {
  return {
    code,
    name: v.name,
    orientation: v.orientation,
    tags: parseTags(v.tags),
    ...(v.location ? { location: v.location } : {}),
    ...(v.groupId ? { groupId: v.groupId } : {}),
  };
}

/**
 * Update body with only the fields that changed. Clearing the location or the group sends `null`
 * (the API's "clear" value); an unchanged group is not sent, so a screen in several groups keeps them.
 */
export function toUpdateBody(screen: Pick<Screen, "name" | "location" | "orientation" | "tags" | "groups">, v: ScreenFormValues): Schemas["UpdateScreenBody"] {
  const body: Schemas["UpdateScreenBody"] = {};
  if (v.name !== screen.name) body.name = v.name;
  if (v.location !== (screen.location ?? "")) body.location = v.location || null;
  if (v.orientation !== screen.orientation) body.orientation = v.orientation;
  const tags = parseTags(v.tags);
  if (tags.join(",") !== (screen.tags ?? []).join(",")) body.tags = tags;
  if (v.groupId !== ((screen.groups ?? [])[0]?.id ?? "")) body.groupId = v.groupId || null;
  return body;
}

/** API codes that mean "the code on the screen is wrong/stale": the flow goes back to the code step. */
export const isPairingCodeError = (e: unknown) => e instanceof ApiError && (e.code.startsWith("PAIRING_CODE") || e.code === "DEVICE_ALREADY_PAIRED");
