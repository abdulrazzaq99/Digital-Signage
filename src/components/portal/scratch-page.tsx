"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, QueryState, Skeleton } from "@/components/ui/query-state";
import { useAttempt, useCampaigns, useEligibility } from "@/lib/api/hooks/campaigns";
import type { AttemptResult, Campaign } from "@/lib/api/types";
import { errorMessage, formatDate, friendlyCode } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Check, Gift, Info, Loader2, Play, Star, Ticket } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Phase = "card" | "checking" | "eligible" | "scratching" | "result" | "blocked";
const CHECKS = ["Verifying campaign status", "Checking your eligibility", "Confirming available attempts"];

/**
 * The outcome is decided by the API the moment the user starts scratching (before anything is
 * revealed), so the card can only ever show the result that was actually recorded.
 */
function Campaign({ campaign }: { campaign: Campaign }) {
  const [phase, setPhase] = useState<Phase>("card");
  const [checkStep, setCheckStep] = useState(0);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [blockedReason, setBlockedReason] = useState("");
  const eligibility = useEligibility(campaign.id);
  const attempt = useAttempt(campaign.id);
  const c = campaign;

  // Staged "checking" animation that ends on the real eligibility answer.
  useEffect(() => {
    if (phase !== "checking") return;
    if (checkStep >= CHECKS.length) {
      if (eligibility.isPending) return;
      const t = setTimeout(() => {
        if (eligibility.data?.eligible) setPhase("eligible");
        else { setBlockedReason(eligibility.data?.reason ? friendlyCode(eligibility.data.reason) : eligibility.error ? errorMessage(eligibility.error) : "You are not eligible for this campaign."); setPhase("blocked"); }
      }, 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCheckStep((s) => s + 1), 600);
    return () => clearTimeout(t);
  }, [phase, checkStep, eligibility.isPending, eligibility.data, eligibility.error]);

  const play = () => { setCheckStep(0); eligibility.refetch(); setPhase("checking"); };
  const start = () => attempt.mutate(undefined, { onSuccess: (r) => { setResult(r); setPhase("scratching"); }, onError: (e) => { setBlockedReason(errorMessage(e)); setPhase("blocked"); } });
  const attemptsLeft = eligibility.data?.attemptsRemaining ?? c.maxAttempts;
  const offersRequired = blockedReason.toLowerCase().includes("offers");

  return (
    <div className="max-w-[430px]">
      {phase === "card" && (
        <Card className="overflow-hidden animate-fade-in">
          <div className="relative aspect-[16/10] bg-gradient-to-br from-indigo-700 via-slate-900 to-slate-900">
            {c.artworkUrl && <img src={c.artworkUrl} alt="" className="h-full w-full object-cover opacity-70" />}
            <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white">● ACTIVE</span>
            <span className="absolute right-3 top-3 rounded bg-black/50 px-2 py-0.5 text-[10px] text-white">Ends {formatDate(c.endsAt)}</span>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-4 pt-12 text-white"><h1 className="text-xl font-bold">{c.title}</h1>{c.description && <p className="mt-1 text-[11px] leading-4 text-white/80">{c.description}</p>}</div>
          </div>
          <div className="px-5 py-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Prizes up for grabs</div>
            <ul className="mt-2 space-y-2">{c.prizes.map((p) => <li key={p.id} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2 text-slate-700"><span className={cn("h-1.5 w-1.5 rounded-full", p.remaining > 0 ? "bg-blue-600" : "bg-slate-300")} />{p.name}{p.remaining === 0 && <span className="text-[10px] text-slate-400">(all claimed)</span>}</span><span className="font-semibold text-slate-900">{p.value ?? ""}</span></li>)}</ul>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-[11px] text-slate-500"><span className="font-semibold text-slate-800">{c.maxAttempts}</span> attempt{c.maxAttempts === 1 ? "" : "s"} per eligible account</span><Button size="sm" onClick={play}><Play className="h-3.5 w-3.5 fill-current" /> Play Now</Button></div>
          </div>
        </Card>
      )}
      {phase === "card" && <p className="mt-3 text-center text-[10px] text-slate-400">{c.requireOffersVisit ? "Visit the Offers page before playing. " : ""}Results are drawn by the platform and cannot be influenced.</p>}

      {phase === "checking" && (
        <Card className="max-w-[270px] px-6 py-6 text-center animate-fade-in">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Loader2 className="h-5 w-5 animate-spin" /></span>
          <div className="mt-3 text-sm font-semibold text-slate-900">Checking eligibility...</div><div className="text-[11px] text-slate-400">Confirming available attempts</div>
          <ul className="mt-4 space-y-1.5 text-left">{CHECKS.map((label, i) => <li key={label} className={cn("flex items-center gap-2 text-[11px]", i < checkStep ? "text-green-600" : i === checkStep ? "font-semibold text-blue-600" : "text-slate-300")}>{i < checkStep ? <Check className="h-3 w-3" /> : i === checkStep ? <Loader2 className="h-3 w-3 animate-spin" /> : <span className="h-3 w-3 rounded-full border border-slate-200" />}{label}</li>)}</ul>
        </Card>
      )}

      {phase === "eligible" && (
        <Card className="max-w-[380px] overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-8 text-center text-white"><span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-amber-400"><Star className="h-5 w-5 fill-current" /></span><div className="mt-3 text-lg font-bold">You&apos;re eligible!</div><div className="text-[11px] text-white/60">{attemptsLeft} attempt{attemptsLeft === 1 ? "" : "s"} available · Result drawn by the platform</div></div>
          <div className="px-6 py-5 text-center"><p className="text-xs leading-5 text-slate-500">Your scratch card is ready. Starting uses one attempt; scratch to reveal the result.</p><Button className="mt-4 w-full" onClick={start} disabled={attempt.isPending}><Gift className="h-3.5 w-3.5" /> {attempt.isPending ? "Preparing your card…" : "Start Scratch"}</Button><p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-slate-400"><Info className="h-3 w-3" /> Result cannot be influenced by the user</p></div>
        </Card>
      )}

      {phase === "scratching" && result && <ScratchCard result={result} onReveal={() => setPhase("result")} />}

      {phase === "result" && result && (
        <Card className="max-w-[380px] overflow-hidden animate-fade-in">
          {result.outcome === "WIN" ? (
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 px-6 py-8 text-center text-white"><span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/20"><Gift className="h-5 w-5" /></span><div className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-white/70">Congratulations</div><div className="mt-1 text-lg font-bold">You won: {result.prize?.name}</div>{result.prize?.value && <div className="text-[11px] text-white/70">Worth {result.prize.value}</div>}</div>
          ) : (
            <div className="bg-gradient-to-br from-slate-700 to-slate-900 px-6 py-8 text-center text-white"><span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/10"><Ticket className="h-5 w-5" /></span><div className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-white/70">Not this time</div><div className="mt-1 text-lg font-bold">Better luck next time</div></div>
          )}
          <div className="px-6 py-5 text-center"><p className="text-xs leading-5 text-slate-500">{result.outcome === "WIN" ? "Your account manager will be in touch within 2 business days to arrange your prize." : `${result.attemptsRemaining} attempt${result.attemptsRemaining === 1 ? "" : "s"} remaining.`}</p><Button variant="secondary" className="mt-4 w-full" onClick={() => { setResult(null); setPhase("card"); }}>Back to campaign</Button></div>
        </Card>
      )}

      {phase === "blocked" && (
        <Card className="max-w-[360px] px-6 py-8 text-center animate-fade-in">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400"><Info className="h-5 w-5" /></span>
          <div className="mt-3 text-sm font-semibold text-slate-900">{offersRequired ? "One more step" : "Not available"}</div><p className="mt-1 text-[11px] text-slate-400">{blockedReason}</p>
          <div className="mt-4 flex justify-center gap-2">{offersRequired && <Button size="sm" href="/portal/offers">Go to Offers</Button>}<Button variant="secondary" size="sm" onClick={() => setPhase("card")}>Back</Button></div>
        </Card>
      )}
    </div>
  );
}

function ScratchCard({ result, onReveal }: { result: AttemptResult; onReveal: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pct, setPct] = useState(0);
  const revealed = useRef(false);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const rect = cv.getBoundingClientRect(); cv.width = rect.width * 2; cv.height = rect.height * 2; ctx.scale(2, 2);
    const g = ctx.createLinearGradient(0, 0, rect.width, rect.height); g.addColorStop(0, "#94a3b8"); g.addColorStop(1, "#64748b");
    ctx.fillStyle = g; ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = "600 14px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText("Scratch here to reveal your result", rect.width / 2, rect.height / 2);
  }, []);

  const scratch = (x: number, y: number) => {
    const cv = canvasRef.current; const ctx = cv?.getContext("2d"); if (!cv || !ctx) return;
    const r = cv.getBoundingClientRect();
    ctx.globalCompositeOperation = "destination-out"; ctx.beginPath(); ctx.arc(x - r.left, y - r.top, 22, 0, Math.PI * 2); ctx.fill();
    const data = ctx.getImageData(0, 0, cv.width, cv.height).data; let clear = 0;
    for (let i = 3; i < data.length; i += 4 * 16) if (data[i] === 0) clear++;
    const p = Math.round((clear / (data.length / (4 * 16))) * 100); setPct(p);
    if (p >= 55 && !revealed.current) { revealed.current = true; setTimeout(onReveal, 500); }
  };

  const win = result.outcome === "WIN";
  return (
    <Card className="max-w-[380px] overflow-hidden animate-fade-in">
      <div className={cn("relative aspect-video select-none bg-gradient-to-br", win ? "from-amber-400 to-orange-500" : "from-slate-500 to-slate-700")}>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">{win ? <Gift className="h-8 w-8" /> : <Ticket className="h-8 w-8" />}<div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-white/80">{win ? "You won" : "No prize this time"}</div><div className="text-base font-bold">{win ? result.prize?.name : "Thanks for playing"}</div></div>
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-crosshair touch-none" onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); scratch(e.clientX, e.clientY); }} onPointerMove={(e) => e.buttons === 1 && scratch(e.clientX, e.clientY)} />
      </div>
      <div className="flex items-center justify-between px-5 py-3 text-[11px] text-slate-500"><span>Drag to scratch the card</span><span className="font-semibold text-slate-700">{pct}% revealed</span></div>
    </Card>
  );
}

export function ScratchPage() {
  const campaigns = useCampaigns({ status: "ACTIVE", pageSize: 5 });
  return (
    <QueryState query={campaigns} skeleton={<Skeleton className="h-96 max-w-[430px]" />} empty={<EmptyState icon={<Ticket className="h-5 w-5" />} title="No active campaign" body="Scratch & Win campaigns appear here while they are running." action={<Link href="/portal/offers" className="text-xs font-medium text-blue-600 hover:underline">Browse current offers →</Link>} />}>
      {({ data }) => <div className="space-y-6">{data.map((c) => <Campaign key={c.id} campaign={c} />)}</div>}
    </QueryState>
  );
}
