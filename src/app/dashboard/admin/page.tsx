import { Activity, ShieldCheck, Users, WandSparkles } from "lucide-react";

import { AdminUserManagement } from "@/features/dashboard/components/admin-user-management";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableSection,
} from "@/components/ui/table";
import { requirePageSession } from "@/features/auth/server/session";
import { getAdminDashboardData } from "@/features/dashboard/server/dashboard-data";
import { formatDate } from "@/utils/format";

export default async function AdminDashboardPage() {
  const session = await requirePageSession(["admin"]);
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-400">
          Admin control center
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
          Track platform usage, user mix, and analysis throughput in one view.
        </h2>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Users"
          value={String(data.stats.userCount)}
          helper={`${data.stats.recruiterCount} recruiters, ${data.stats.individualCount} individuals`}
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          label="Analyses"
          value={String(data.stats.analysisCount)}
          helper="Stored profile evaluations"
          icon={<Activity className="h-5 w-5" />}
        />
        <StatsCard
          label="Average score"
          value={`${data.stats.averageScore}/100`}
          helper="Platform-wide score average"
          icon={<WandSparkles className="h-5 w-5" />}
        />
        <StatsCard
          label="Admins"
          value={String(data.stats.adminCount)}
          helper="Privileged control accounts"
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </section>

      <AdminUserManagement initialUsers={data.users} currentAdminId={session.user.id} />

      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-[var(--foreground)]">Analyses</h3>
          <p className="text-sm text-[var(--muted)]">
            Most recent profile scans stored in MongoDB.
          </p>
        </div>
        <Table>
          <thead>
            <tr>
              <TableHead>GitHub</TableHead>
              <TableHead>Requested by</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Top language</TableHead>
              <TableHead>Created</TableHead>
            </tr>
          </thead>
          <TableSection>
            {data.analyses.map((analysis) => (
              <TableRow key={analysis.id}>
                <TableCell>{analysis.githubUsername}</TableCell>
                <TableCell className="capitalize">{analysis.requestedByRole}</TableCell>
                <TableCell className="uppercase">{analysis.source}</TableCell>
                <TableCell>{analysis.hireabilityScore}/100</TableCell>
                <TableCell>{analysis.metrics.topLanguages[0]?.name ?? "None"}</TableCell>
                <TableCell>{formatDate(analysis.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableSection>
        </Table>
      </section>
    </div>
  );
}
