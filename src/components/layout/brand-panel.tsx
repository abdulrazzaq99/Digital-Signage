import { LayoutDashboard } from "lucide-react";

export function BrandPanel() {
  return (
    <div className="relative hidden w-[45%] shrink-0 overflow-hidden bg-navy-900 text-white lg:flex lg:flex-col">
      <div className="flex items-center gap-2.5 px-12 pt-12">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600"><LayoutDashboard className="h-4 w-4" /></div>
        <span className="text-sm font-semibold">Digital Signage Platform</span>
      </div>

      {/* A shop's screens, drawn flat: one showing an offer, one a menu, one idle. */}
      <div className="relative mx-auto mt-16 h-[290px] w-[400px]" aria-hidden>
        <div className="absolute left-12 top-0 h-[150px] w-[266px] rounded-md border border-navy-850 bg-navy-950 p-1.5">
          <div className="flex h-full flex-col items-center justify-center gap-1 rounded-[3px] bg-navy-800">
            <div className="text-[10px] font-medium text-navy-300">Summer sale</div>
            <div className="text-xl font-bold">30% off</div>
          </div>
          <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-green-500" />
        </div>
        <div className="absolute right-6 top-8 h-[176px] w-[99px] rounded-md border border-navy-850 bg-navy-950 p-1.5">
          <div className="h-full rounded-[3px] bg-navy-800 p-2">
            <div className="mx-auto mt-6 h-8 w-8 rounded-full bg-navy-600" />
            <div className="mt-6 h-1.5 w-full rounded bg-navy-600" />
            <div className="mt-1.5 h-1.5 w-2/3 rounded bg-navy-600" />
          </div>
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-500" />
        </div>
        <div className="absolute left-4 top-[125px] h-[114px] w-[114px] rounded-md border border-navy-850 bg-navy-950 p-2">
          <div className="flex items-center gap-1 text-[8px] text-navy-300"><span className="h-1 w-1 rounded-full bg-green-500" />Menu</div>
          <div className="mt-2 space-y-1.5">
            <div className="h-1.5 w-10/12 rounded bg-navy-700" />
            <div className="h-1.5 w-1/2 rounded bg-navy-700" />
            <div className="h-1.5 w-2/3 rounded bg-navy-700" />
          </div>
        </div>
        <div className="absolute left-[92px] top-[210px] h-[82px] w-[288px] rounded-md border border-navy-850 bg-navy-800 p-3">
          <div className="flex h-full items-center gap-3">
            <div className="h-6 w-6 rounded bg-navy-600" />
            <div className="flex-1 space-y-1.5"><div className="h-1.5 w-3/4 rounded bg-navy-600" /><div className="h-1.5 w-1/2 rounded bg-navy-600" /></div>
            <div className="flex h-6 items-center rounded bg-brand-600 px-2.5 text-[9px] font-semibold">Publish</div>
          </div>
        </div>
      </div>

      <div className="mt-auto px-12 pb-12">
        <h2 className="max-w-md text-2xl font-bold leading-tight">Run every screen in your shops from one place</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-navy-300">Upload once, schedule by the hour, and see which screens are playing right now.</p>
      </div>
    </div>
  );
}

export function AuthFooter() {
  return (
    <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400">
      <a href="#" className="hover:text-slate-600">Privacy policy</a>
      <a href="#" className="hover:text-slate-600">Terms of service</a>
      <span>© 2026 Digital Signage Platform</span>
    </div>
  );
}
