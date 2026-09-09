import { CompanyDetail } from "@/components/companies/company-detail";
import { companies } from "@/lib/data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return companies.map((c) => ({ id: c.id }));
}

export default async function CompanyPage({ params }: PageProps<"/companies/[id]">) {
  const { id } = await params;
  const company = companies.find((c) => c.id === id);
  if (!company) notFound();
  return <CompanyDetail company={company} />;
}
