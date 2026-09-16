import { OfferDetail } from "@/components/portal/offer-detail";
import { portalOffers } from "@/lib/portal-data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return portalOffers.map((o) => ({ id: o.id }));
}

export default async function Page({ params }: PageProps<"/portal/offers/[id]">) {
  const { id } = await params;
  const offer = portalOffers.find((o) => o.id === id);
  if (!offer) notFound();
  return <OfferDetail offer={offer} />;
}
