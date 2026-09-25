import { Suspense } from "react";
import { SettingsPage } from "@/components/settings/settings-page";

export default function Page() {
  // The page reads ?tab= (useSearchParams), which Next requires inside a Suspense boundary.
  return <Suspense><SettingsPage /></Suspense>;
}
