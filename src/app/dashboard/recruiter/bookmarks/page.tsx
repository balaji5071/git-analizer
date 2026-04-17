import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePageSession } from "@/features/auth/server/session";
import { getRecruiterDashboardData } from "@/features/dashboard/server/dashboard-data";

export default async function RecruiterBookmarksPage() {
  const session = await requirePageSession(["recruiter"]);
  const data = await getRecruiterDashboardData(session.user.id);

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-400">
          Recruiter bookmarks
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
          Saved candidates for follow-up.
        </h2>
        <p className="max-w-3xl text-base leading-7 text-[var(--muted)]">
          Keep your shortlist organized and quickly revisit candidates you flagged during screening.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Bookmarked candidates</CardTitle>
          <CardDescription>
            Click a username to open the public GitHub profile in a new tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {data.bookmarks.length > 0 ? (
            data.bookmarks.map((bookmark) => (
              <Link
                key={bookmark}
                href={`https://github.com/${bookmark}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300 transition hover:border-emerald-400/40 hover:bg-emerald-500/20"
              >
                {bookmark}
              </Link>
            ))
          ) : (
            <p className="text-sm text-[var(--muted)]">No candidates bookmarked yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
