import { Bookmark, Clock3, Trophy, Users } from "lucide-react";

import { AnalyzerWorkspace } from "@/features/dashboard/components/analyzer-workspace";
import { requirePageSession } from "@/features/auth/server/session";
import { getRecruiterDashboardData } from "@/features/dashboard/server/dashboard-data";
import { StatsCard } from "@/components/dashboard/stats-card";
import { formatDate } from "@/utils/format";

export default async function RecruiterDashboardPage() {
  const session = await requirePageSession(["recruiter"]);
  const data = await getRecruiterDashboardData(session.user.id);

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-400">
          Recruiter workflow
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
          Evaluate candidates using public GitHub signals and AI-assisted screening.
        </h2>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Analyses"
          value={String(data.stats.analysisCount)}
          helper="Recent candidate evaluations"
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          label="Bookmarks"
          value={String(data.stats.bookmarksCount)}
          helper="Saved for follow-up"
          icon={<Bookmark className="h-5 w-5" />}
        />
        <StatsCard
          label="Average score"
          value={`${data.stats.averageScore}/100`}
          helper="Across your recent history"
          icon={<Trophy className="h-5 w-5" />}
        />
        <StatsCard
          label="Latest activity"
          value={data.stats.latestAnalysisAt ? formatDate(data.stats.latestAnalysisAt) : "N/A"}
          helper="Most recent completed analysis"
          icon={<Clock3 className="h-5 w-5" />}
        />
      </section>

      <AnalyzerWorkspace
        role="recruiter"
        title="Candidate intelligence"
        description="Search a GitHub username to generate an AI summary, strengths, weaknesses, and a hireability score."
        history={data.analyses}
        bookmarks={data.bookmarks}
      />
    </div>
  );
}
