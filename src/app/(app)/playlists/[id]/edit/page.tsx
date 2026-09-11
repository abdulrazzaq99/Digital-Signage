import { PlaylistEditor } from "@/components/playlists/playlist-editor";
import { playlists } from "@/lib/data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return playlists.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: PageProps<"/playlists/[id]/edit">) {
  const { id } = await params;
  const playlist = playlists.find((p) => p.id === id);
  if (!playlist) notFound();
  return <PlaylistEditor playlist={playlist} />;
}
