import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader, Progress } from "@/components/ui/misc";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { canvases } from "@/lib/data";
import { img } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";

const swatches = ["bg-blue-500", "bg-violet-500", "bg-emerald-500"];

export function CanvasList() {
  return (
    <div className="space-y-5">
      <PageHeader title="Synchronized Canvas" subtitle="Combine adjacent compatible screens into one synchronized logical display." action={<Button href="/screens/canvas/new"><Plus className="h-4 w-4" /> Create Canvas</Button>} />
      <Card>
        <Table>
          <THead><tr><TH>Canvas Name</TH><TH>Screens</TH><TH>Layout</TH><TH>Readiness</TH><TH>Status</TH><TH className="text-right">Actions</TH></tr></THead>
          <tbody>
            {canvases.filter((c) => c.screens > 0).map((c) => (
              <TR key={c.id}>
                <TD>
                  <Link href={`/screens/canvas/${c.id}`} className="flex items-center gap-3">
                    {c.seed ? <img src={img(c.seed, 96, 64)} alt="" className="h-8 w-12 rounded object-cover" /> : <span className="h-8 w-12 rounded bg-slate-900" />}
                    <span><span className="block text-sm font-semibold text-slate-900">{c.name}</span><span className="block text-[11px] text-slate-400">Created {c.created}</span></span>
                  </Link>
                </TD>
                <TD><span className="flex items-center gap-1.5">{Array.from({ length: c.screens }).map((_, i) => <span key={i} className={`h-2.5 w-4 rounded-sm ${swatches[i % 3]}`} />)}<span className="ml-1 text-xs font-semibold text-slate-700">{c.screens}</span></span></TD>
                <TD className="text-xs whitespace-nowrap">{c.layout}</TD>
                <TD><div className="w-20"><div className={`text-xs font-semibold ${c.ready === c.screens ? "text-green-600" : "text-amber-600"}`}>{c.ready} of {c.screens} ready</div><Progress value={(c.ready / c.screens) * 100} tone={c.ready === c.screens ? "green" : "amber"} thin className="mt-1" /></div></TD>
                <TD><StatusBadge status={c.status} /></TD>
                <TD className="text-right"><Button href={`/screens/canvas/${c.id}`} variant="secondary" size="sm">View</Button></TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
