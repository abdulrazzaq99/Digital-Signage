import { PlaylistEditor } from "@/components/portal/playlist-editor";

export default async function Page({ params }: PageProps<"/portal/playlists/[id]/edit">) {
  const { id } = await params;
  return <PlaylistEditor id={id} />;
}
