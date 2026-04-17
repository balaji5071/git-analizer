import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

export function StatsCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm text-[var(--muted)]">{label}</p>
            <p className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {value}
            </p>
            <p className="text-sm text-[var(--muted)]">{helper}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-500">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
