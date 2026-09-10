import { LicenseDetail } from "@/components/licenses/license-detail";
import { companies } from "@/lib/data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return companies.map((c) => ({ id: c.id }));
}

export default async function LicensePage({ params }: PageProps<"/licenses/[id]">) {
  const { id } = await params;
  const company = companies.find((c) => c.id === id);
  if (!company) notFound();
  return <LicenseDetail company={company} />;
}
