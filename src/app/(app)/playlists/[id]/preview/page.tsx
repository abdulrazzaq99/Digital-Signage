import { AdminPlaylistEditor } from "@/components/playlists/playlist-editor";
import { Suspense } from "react";

export default async function Page({ params }: PageProps<"/playlists/[id]/preview">) {
  const { id } = await params;
  return <Suspense><AdminPlaylistEditor id={id} view="preview" /></Suspense>;
}
