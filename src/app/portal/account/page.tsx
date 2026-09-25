import { Suspense } from "react";
import { AccountPage } from "@/components/portal/account-page";

export default function Page() {
  // The page reads ?tab= (useSearchParams), which Next requires inside a Suspense boundary.
  return <Suspense><AccountPage /></Suspense>;
}
