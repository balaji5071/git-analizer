import Link from "next/link";

import { cn } from "@/utils/cn";

export function AppLogo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-3 text-left", className)}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-emerald-500/15 text-lg font-semibold text-emerald-500 shadow-[0_0_30px_rgba(34,197,94,0.22)]">
        AI
      </span>
      {!compact ? (
        <span className="space-y-0.5">
          <span className="block text-sm font-semibold tracking-tight text-[var(--foreground)]">
            GitHub Profile Analyzer
          </span>
          <span className="block text-xs text-[var(--muted)]">
            Recruiter-grade developer intelligence
          </span>
        </span>
      ) : null}
    </Link>
  );
}
