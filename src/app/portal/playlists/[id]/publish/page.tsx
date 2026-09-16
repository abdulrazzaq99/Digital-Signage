import { PlaylistPublish } from "@/components/portal/playlist-publish";
import { portalPlaylists, type PortalPlaylist } from "@/lib/portal-data";

export function generateStaticParams() {
  return portalPlaylists.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: PageProps<"/portal/playlists/[id]/publish">) {
  const { id } = await params;
  const playlist: PortalPlaylist = portalPlaylists.find((p) => p.id === id) ?? { id, name: id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), items: [], status: "Draft", assignedTo: [], updated: "Just now" };
  return <PlaylistPublish playlist={playlist} />;
}
