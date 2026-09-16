import { PlaylistPreview } from "@/components/portal/playlist-preview";

export default async function Page({ params }: PageProps<"/portal/playlists/[id]/preview">) {
  const { id } = await params;
  return <PlaylistPreview id={id} />;
}
