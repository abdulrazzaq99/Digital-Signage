import { OfferForm } from "@/components/offers/offer-form";
import { offers } from "@/lib/data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return offers.map((o) => ({ id: o.id }));
}

export default async function Page({ params }: PageProps<"/offers/[id]/preview">) {
  const { id } = await params;
  const offer = offers.find((o) => o.id === id);
  if (!offer) notFound();
  return <OfferForm offer={offer} mode="preview" />;
}
