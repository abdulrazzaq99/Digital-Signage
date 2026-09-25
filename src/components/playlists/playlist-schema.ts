/**
 * Playlist form rules shared by the portal and admin screens. Mirrors the API's playlist schemas:
 * names up to 120 characters, at most 200 items, each shown for 1–3600 whole seconds.
 */
import { intText, text } from "@/lib/validation/fields";
import { z } from "zod";

export const PLAYLIST_NAME_MAX = 120;
export const PLAYLIST_MAX_ITEMS = 200;
export const DURATION_MIN = 1;
/** The API allows a slot of up to an hour. */
export const DURATION_MAX = 3600;
export const DEFAULT_DURATION = 10;

export const playlistName = () => text(PLAYLIST_NAME_MAX, 2);
export const playlistNameSchema = z.object({ name: playlistName() });

/** A slot duration typed into a text box: whole seconds, 1–3600. */
export const durationText = () => intText(DURATION_MIN, DURATION_MAX, "Duration");

/** Starting duration for a newly added asset: a video's own length (clamped), otherwise 10 s. */
export const initialDuration = (m: { type: string; durationSec?: number | null }) =>
  String(m.type === "VIDEO" && m.durationSec ? Math.min(DURATION_MAX, Math.max(DURATION_MIN, Math.round(m.durationSec))) : DEFAULT_DURATION);

export const playlistItemSchema = z.object({
  assetId: z.string().min(1),
  name: z.string(),
  type: z.enum(["IMAGE", "VIDEO", "PDF"]),
  thumbnailUrl: z.string().nullable(),
  duration: durationText(),
});

export const playlistEditorSchema = z.object({
  name: playlistName(),
  items: z.array(playlistItemSchema).max(PLAYLIST_MAX_ITEMS, `A playlist can hold at most ${PLAYLIST_MAX_ITEMS} items`),
});
export type PlaylistEditorInput = z.input<typeof playlistEditorSchema>;
export type PlaylistEditorValues = z.output<typeof playlistEditorSchema>;

/** Update body from validated editor values. */
export const toPlaylistBody = (v: PlaylistEditorValues) => ({ name: v.name, items: v.items.map((it) => ({ assetId: it.assetId, durationSec: Number(it.duration) })) });

/** Seconds of a (possibly half-typed) duration, 0 when not a valid number yet: for live totals. */
export const secondsOf = (v: string) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= DURATION_MIN && n <= DURATION_MAX ? n : 0;
};
