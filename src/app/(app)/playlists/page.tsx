import { PlaylistsPage } from "@/components/playlists/playlists-page";
import { Suspense } from "react";

export default function Page() {
  return <Suspense><PlaylistsPage /></Suspense>;
}
