import { ChartSpline, Flame, GitBranch, UserRound } from "lucide-react";

import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePageSession } from "@/features/auth/server/session";
import { AnalyzerWorkspace } from "@/features/dashboard/components/analyzer-workspace";
import { getIndividualDashboardData } from "@/features/dashboard/server/dashboard-data";

export default async function IndividualDashboardPage() {
  const session = await requirePageSession(["individual"]);
  const data = await getIndividualDashboardData(session.user.id);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-400">
            Individual coaching
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Understand how your public GitHub profile reads to a technical recruiter.
          </h2>
          <p className="max-w-3xl text-base leading-7 text-[var(--muted)]">
            Store private history, compare score improvements over time, and turn AI feedback into
            a focused roadmap.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile snapshot</CardTitle>
            <CardDescription>Quick reference for your saved account details.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-[var(--muted)]">Name</p>
              <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                {data.profile?.name ?? session.user.name ?? "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">GitHub</p>
              <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                {data.profile?.githubUsername ?? "Add your handle below"}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Email</p>
              <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                {data.profile?.email ?? session.user.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Role</p>
              <p className="mt-2 text-base font-semibold capitalize text-[var(--foreground)]">
                {data.profile?.role ?? session.user.role}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Analyses"
          value={String(data.stats.analysisCount)}
          helper="Private history entries"
          icon={<UserRound className="h-5 w-5" />}
        />
        <StatsCard
          label="Best score"
          value={`${data.stats.bestScore}/100`}
          helper="Highest recorded hireability score"
          icon={<Flame className="h-5 w-5" />}
        />
        <StatsCard
          label="Top language"
          value={data.stats.topLanguage}
          helper="Most recent leading language"
          icon={<GitBranch className="h-5 w-5" />}
        />
        <StatsCard
          label="Trajectory"
          value={data.stats.analysisCount > 1 ? "Tracked" : "Starting"}
          helper="Compare future results over time"
          icon={<ChartSpline className="h-5 w-5" />}
        />
      </section>

      <AnalyzerWorkspace
        role="individual"
        title="Profile analysis"
        description="Run a private scan of your GitHub profile to see strengths, weaknesses, and a practical improvement roadmap."
        history={data.analyses}
        defaultUsername={data.profile?.githubUsername}
      />
    </div>
  );
}
