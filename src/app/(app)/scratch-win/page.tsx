import { CampaignsPage } from "@/components/scratch/campaigns-page";

export default async function Page({ searchParams }: PageProps<"/scratch-win">) {
  const { tab } = await searchParams;
  return <CampaignsPage tab={tab === "winners" ? "winners" : "campaigns"} />;
}
