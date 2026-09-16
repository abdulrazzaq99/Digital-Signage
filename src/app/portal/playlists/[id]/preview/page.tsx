import { PlaylistPreview } from "@/components/portal/playlist-preview";
import { portalPlaylists, type PortalPlaylist } from "@/lib/portal-data";

export function generateStaticParams() {
  return portalPlaylists.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: PageProps<"/portal/playlists/[id]/preview">) {
  const { id } = await params;
  const playlist: PortalPlaylist = portalPlaylists.find((p) => p.id === id) ?? { id, name: id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), items: [], status: "Draft", assignedTo: [], updated: "Just now" };
  return <PlaylistPreview playlist={playlist} />;
}
