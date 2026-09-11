import { MarketplaceOffer } from "@/components/offers/offer-detail";
import { offers } from "@/lib/data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return offers.map((o) => ({ id: o.id }));
}

export default async function Page({ params }: PageProps<"/offers/marketplace/[id]">) {
  const { id } = await params;
  const offer = offers.find((o) => o.id === id);
  if (!offer) notFound();
  return <MarketplaceOffer offer={offer} />;
}
