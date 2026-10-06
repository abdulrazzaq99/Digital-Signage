import { LayoutDashboard } from "lucide-react";

export function BrandPanel() {
  return (
    <div className="relative hidden w-[45%] shrink-0 overflow-hidden bg-slate-900 text-white lg:flex lg:flex-col">
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.35)_0%,rgba(37,99,235,0)_70%)]" />
      <div className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.25)_0%,rgba(37,99,235,0)_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(37,99,235,0.05),transparent)]" />

      <div className="relative flex items-center gap-2.5 px-12 pt-12">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600"><LayoutDashboard className="h-4 w-4" /></div>
        <span className="text-sm font-semibold">Digital Signage Platform</span>
      </div>

      <div className="relative mx-auto mt-16 h-[290px] w-[400px]">
        <div className="absolute left-12 top-0 h-[150px] w-[266px] rounded-md border border-blue-600/25 bg-[#111827] shadow-2xl">
          <div className="flex h-full flex-col items-center justify-center gap-1 rounded-md bg-gradient-to-br from-blue-800 to-blue-950">
            <div className="text-[9px] font-semibold tracking-wide text-blue-200">SUMMER SALE</div>
            <div className="text-xl font-bold">30% OFF</div>
          </div>
          <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-blue-600" />
          <span className="absolute -bottom-1 right-8 h-2 w-2 rounded-full bg-blue-600" />
        </div>
        <div className="absolute right-6 top-8 h-[176px] w-[99px] rounded-md border border-blue-700/25 bg-[#111827] p-2 shadow-2xl">
          <div className="h-full rounded bg-gradient-to-b from-blue-900 to-slate-900 p-2">
            <div className="mx-auto mt-6 h-8 w-8 rounded-full bg-blue-600/60" />
            <div className="mt-6 h-1.5 w-full rounded bg-blue-200/30" />
            <div className="mt-1.5 h-1.5 w-2/3 rounded bg-blue-200/30" />
          </div>
        </div>
        <div className="absolute left-4 top-[125px] h-[114px] w-[114px] rounded-md border border-blue-700/25 bg-[#111827] p-2 shadow-2xl">
          <div className="text-[6px] text-blue-300">LIVE</div>
          <div className="mt-2 space-y-1.5">
            <div className="h-1.5 w-10/12 rounded bg-blue-200/30" />
            <div className="h-1.5 w-1/2 rounded bg-blue-200/30" />
            <div className="h-1.5 w-2/3 rounded bg-blue-200/30" />
          </div>
        </div>
        <div className="absolute left-[92px] top-[210px] h-[82px] w-[288px] rounded-md border border-blue-900/50 bg-[#111827] p-3 shadow-2xl">
          <div className="flex h-full items-center gap-3">
            <div className="h-6 w-6 rounded bg-blue-600/60" />
            <div className="flex-1 space-y-1.5"><div className="h-1.5 w-3/4 rounded bg-blue-200/30" /><div className="h-1.5 w-1/2 rounded bg-blue-200/30" /></div>
            <div className="h-6 w-14 rounded bg-blue-600" />
          </div>
        </div>
      </div>

      <div className="relative mt-auto px-12 pb-12">
        <h2 className="max-w-md text-2xl font-bold leading-tight">One platform for every screen in your network</h2>
        <p className="mt-3 text-sm text-slate-400">Manage, schedule, and control your digital displays from one place.</p>
        <div className="mt-8 flex gap-10">
          {[["12K+", "Screens managed"], ["99.9%", "Uptime SLA"], ["180+", "Countries"]].map(([v, l]) => (
            <div key={l}><div className="text-lg font-bold">{v}</div><div className="text-[11px] text-slate-400">{l}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AuthFooter() {
  return (
    <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400">
      <a href="#" className="hover:text-slate-600">Privacy Policy</a>
      <a href="#" className="hover:text-slate-600">Terms of Service</a>
      <span>© 2026 Digital Signage Platform</span>
    </div>
  );
}
