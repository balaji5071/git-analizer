import { cn } from "@/utils/cn";

function resolveTone(score: number) {
  if (score >= 80) {
    return "border-emerald-500/25 bg-emerald-500/12 text-emerald-400";
  }

  if (score >= 60) {
    return "border-amber-500/25 bg-amber-500/12 text-amber-400";
  }

  return "border-rose-500/25 bg-rose-500/12 text-rose-400";
}

export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
        resolveTone(score),
        className,
      )}
    >
      {score}/100
    </span>
  );
}
