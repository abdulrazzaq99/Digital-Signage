import { MediaDetail } from "@/components/media/media-detail";
import { media } from "@/lib/data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return media.map((m) => ({ id: m.id }));
}

export default async function Page({ params }: PageProps<"/media/[id]">) {
  const { id } = await params;
  const item = media.find((m) => m.id === id);
  if (!item) notFound();
  return <MediaDetail item={item} />;
}
