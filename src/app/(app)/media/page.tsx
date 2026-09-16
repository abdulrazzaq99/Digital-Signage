import { MediaLibrary } from "@/components/media/media-library";
import { Suspense } from "react";

export default function Page() {
  return <Suspense><MediaLibrary /></Suspense>;
}
