import { CreateCanvas } from "@/components/canvas/create-canvas";
import { Suspense } from "react";

export default function Page() {
  return <Suspense><CreateCanvas /></Suspense>;
}
