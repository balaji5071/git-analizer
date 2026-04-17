import { redirect } from "next/navigation";

import { requirePageSession } from "@/features/auth/server/session";
import { HistoryList } from "@/features/dashboard/components/history-list";
import {
  getIndividualDashboardData,
  getRecruiterDashboardData,
} from "@/features/dashboard/server/dashboard-data";

export default async function DashboardHistoryPage() {
  const session = await requirePageSession();

  if (session.user.role === "admin") {
    redirect("/dashboard/admin");
  }

  if (session.user.role === "recruiter") {
    const data = await getRecruiterDashboardData(session.user.id);

    return (
      <div className="space-y-8">
        <section className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-400">
            History
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Revisit your recent candidate analyses.
          </h2>
        </section>

        <HistoryList analyses={data.analyses} />
      </div>
    );
  }

  const data = await getIndividualDashboardData(session.user.id);

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-400">
          History
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
          Revisit your previous profile analyses.
        </h2>
      </section>

      <HistoryList analyses={data.analyses} />
    </div>
  );
}
