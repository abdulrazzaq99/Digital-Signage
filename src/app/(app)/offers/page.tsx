import { OffersPage } from "@/components/offers/offers-page";

export default async function Page({ searchParams }: PageProps<"/offers">) {
  const { tab } = await searchParams;
  return <OffersPage tab={tab === "marketplace" ? "marketplace" : "manage"} />;
}
