import { AdminPlaylistEditor } from "@/components/playlists/playlist-editor";
import { Suspense } from "react";

export default async function Page({ params }: PageProps<"/playlists/[id]/publish">) {
  const { id } = await params;
  return <Suspense><AdminPlaylistEditor id={id} view="publish" /></Suspense>;
}
