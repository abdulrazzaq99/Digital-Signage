import { CampaignsPage } from "@/components/scratch/campaigns-page";
import { Suspense } from "react";

export default async function Page({ searchParams }: PageProps<"/scratch-win">) {
  const { tab } = await searchParams;
  return <Suspense><CampaignsPage tab={tab === "winners" ? "winners" : "campaigns"} /></Suspense>;
}
