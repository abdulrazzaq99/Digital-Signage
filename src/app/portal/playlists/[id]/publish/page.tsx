import { PlaylistPublish } from "@/components/portal/playlist-publish";

export default async function Page({ params }: PageProps<"/portal/playlists/[id]/publish">) {
  const { id } = await params;
  return <PlaylistPublish id={id} />;
}
