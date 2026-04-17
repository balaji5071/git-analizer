"use client";

import { startTransition, useMemo, useState } from "react";
import Image from "next/image";
import { Bookmark, BookmarkCheck, Clock3, Sparkles, WandSparkles } from "lucide-react";

import { ScoreBadge } from "@/components/dashboard/score-badge";
import { SearchBar } from "@/components/dashboard/search-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisDocumentShape } from "@/types/analysis";
import type { UserRole } from "@/types/auth";
import { formatDate, formatNumber } from "@/utils/format";

function InsightList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-emerald-400" />
        <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-white/5 px-4 py-3 text-sm leading-6 text-[var(--muted)]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AnalyzerWorkspace({
  role,
  title,
  description,
  history,
  defaultUsername,
  bookmarks = [],
  showRecentAnalyses = true,
  showBookmarks = true,
}: {
  role: Extract<UserRole, "recruiter" | "individual">;
  title: string;
  description: string;
  history: AnalysisDocumentShape[];
  defaultUsername?: string | null;
  bookmarks?: string[];
  showRecentAnalyses?: boolean;
  showBookmarks?: boolean;
}) {
  const [username, setUsername] = useState(defaultUsername ?? "");
  const [analyses, setAnalyses] = useState(history);
  const [savedBookmarks, setSavedBookmarks] = useState(bookmarks);
  const [activeAnalysisId, setActiveAnalysisId] = useState(history[0]?.id ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const isIndividualRole = role === "individual";
  const showSideColumn = showRecentAnalyses || (role === "recruiter" && showBookmarks);

  const activeAnalysis =
    analyses.find((analysis) => analysis.id === activeAnalysisId) ?? analyses[0] ?? null;

  const isBookmarked = useMemo(() => {
    if (!activeAnalysis) {
      return false;
    }

    return savedBookmarks.includes(activeAnalysis.githubUsername);
  }, [activeAnalysis, savedBookmarks]);

  async function runAnalysis() {
    const targetUsername = isIndividualRole
      ? (defaultUsername ?? username).trim()
      : username.trim();

    if (!targetUsername) {
      setError(
        isIndividualRole
          ? "Your account does not have a GitHub username yet."
          : "Enter a GitHub username to analyze.",
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ githubUsername: targetUsername }),
    });

    const payload = (await response.json()) as {
      error?: string;
      analysis?: AnalysisDocumentShape;
    };

    setIsLoading(false);

    if (!response.ok || !payload.analysis) {
      setError(payload.error ?? "Unable to analyze the GitHub profile right now.");
      return;
    }

    startTransition(() => {
      setAnalyses((current) => [
        payload.analysis!,
        ...current.filter((item) => item.id !== payload.analysis!.id),
      ]);
      setActiveAnalysisId(payload.analysis!.id);
      setUsername(payload.analysis!.githubUsername);
    });
  }

  async function toggleBookmark() {
    if (!activeAnalysis) {
      return;
    }

    setIsBookmarking(true);

    const response = await fetch("/api/bookmarks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ githubUsername: activeAnalysis.githubUsername }),
    });

    const payload = (await response.json()) as {
      bookmarks?: string[];
      error?: string;
    };

    setIsBookmarking(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to update bookmarks.");
      return;
    }

    startTransition(() => {
      setSavedBookmarks(payload.bookmarks ?? []);
    });
  }

  return (
    <div className={showSideColumn ? "grid gap-6 xl:grid-cols-[1.65fr_0.95fr]" : "grid gap-6"}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <SearchBar
              value={username}
              onChange={(nextValue) => {
                if (!isIndividualRole) {
                  setUsername(nextValue);
                }
              }}
              onSubmit={runAnalysis}
              loading={isLoading}
              inputReadOnly={isIndividualRole}
              submitLabel={isIndividualRole ? "Analyze My Profile" : "Run Analysis"}
              label={
                role === "recruiter"
                  ? "Candidate GitHub username"
                  : "Your GitHub username"
              }
              hint={
                role === "recruiter"
                  ? "Search any public GitHub profile and store the analysis in your recruiter history."
                  : "Your account GitHub username is fixed for individual mode."
              }
            />
            {error ? (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {activeAnalysis ? (
          <Card>
            <CardHeader className="gap-5 md:flex md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <Image
                  src={activeAnalysis.githubProfile.avatarUrl}
                  alt={activeAnalysis.githubProfile.username}
                  width={72}
                  height={72}
                  className="rounded-3xl border border-[var(--border)]"
                />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <CardTitle className="text-2xl">
                      {activeAnalysis.githubProfile.displayName ??
                        activeAnalysis.githubProfile.username}
                    </CardTitle>
                    <ScoreBadge score={activeAnalysis.hireabilityScore} />
                    <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      {activeAnalysis.source}
                    </span>
                  </div>
                  <CardDescription className="max-w-3xl">
                    {activeAnalysis.summary}
                  </CardDescription>
                </div>
              </div>

              {role === "recruiter" ? (
                <Button
                  variant={isBookmarked ? "secondary" : "outline"}
                  leftIcon={
                    isBookmarked ? (
                      <BookmarkCheck className="h-4 w-4" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )
                  }
                  onClick={toggleBookmark}
                  disabled={isBookmarking}
                >
                  {isBookmarked ? "Saved" : "Bookmark"}
                </Button>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
                  <p className="text-sm text-[var(--muted)]">Repositories</p>
                  <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                    {formatNumber(activeAnalysis.metrics.totalRepos)}
                  </p>
                </div>
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
                  <p className="text-sm text-[var(--muted)]">Stars</p>
                  <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                    {formatNumber(activeAnalysis.metrics.totalStars)}
                  </p>
                </div>
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
                  <p className="text-sm text-[var(--muted)]">Followers</p>
                  <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                    {formatNumber(activeAnalysis.metrics.followerCount)}
                  </p>
                </div>
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
                  <p className="text-sm text-[var(--muted)]">Top Stack</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                    {activeAnalysis.metrics.topLanguages[0]?.name ?? "Not enough data"}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                <InsightList title="Strengths" items={activeAnalysis.strengths} />
                <InsightList title="Weaknesses" items={activeAnalysis.weaknesses} />
                <InsightList
                  title={role === "individual" ? "Improvement Roadmap" : "Next Steps"}
                  items={activeAnalysis.suggestions}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex min-h-72 items-center justify-center p-10 text-center">
              <div className="space-y-3">
                <WandSparkles className="mx-auto h-10 w-10 text-emerald-400" />
                <p className="text-lg font-semibold text-[var(--foreground)]">
                  No analysis yet
                </p>
                <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
                  Run your first profile scan to populate AI insights, history, and scorecards.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showSideColumn ? (
        <div className="space-y-6">
          {showRecentAnalyses ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent analyses</CardTitle>
                <CardDescription>
                  Click any result to revisit the stored output and GitHub snapshot.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analyses.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">Your analysis history will appear here.</p>
                ) : (
                  analyses.map((analysis) => (
                    <button
                      key={analysis.id}
                      type="button"
                      onClick={() => setActiveAnalysisId(analysis.id)}
                      className={`w-full rounded-3xl border p-4 text-left transition ${
                        activeAnalysis?.id === analysis.id
                          ? "border-emerald-500/30 bg-emerald-500/10"
                          : "border-[var(--border)] bg-[var(--surface-strong)] hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {analysis.githubUsername}
                          </p>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {analysis.metrics.topLanguages[0]?.name ?? "Generalist profile"}
                          </p>
                        </div>
                        <ScoreBadge score={analysis.hireabilityScore} />
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                        <Clock3 className="h-3.5 w-3.5" />
                        {formatDate(analysis.createdAt)}
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          ) : null}

          {role === "recruiter" && showBookmarks ? (
            <Card>
              <CardHeader>
                <CardTitle>Bookmarked candidates</CardTitle>
                <CardDescription>
                  Quick-access list for candidate follow-up and cross-team calibration.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {savedBookmarks.length > 0 ? (
                  savedBookmarks.map((bookmark) => (
                    <span
                      key={bookmark}
                      className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
                    >
                      {bookmark}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-[var(--muted)]">
                    No candidates bookmarked yet.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
