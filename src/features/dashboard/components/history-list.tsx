"use client";

import { Download, FileText } from "lucide-react";

import { ScoreBadge } from "@/components/dashboard/score-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisDocumentShape } from "@/types/analysis";
import { formatDate } from "@/utils/format";

function buildReportContent(analysis: AnalysisDocumentShape) {
  return [
    `# Git Analyzer Report`,
    "",
    `Generated at: ${formatDate(analysis.createdAt)}`,
    `GitHub Username: ${analysis.githubUsername}`,
    `Display Name: ${analysis.githubProfile.displayName ?? "N/A"}`,
    `Hireability Score: ${analysis.hireabilityScore}/100`,
    `Source: ${analysis.source}`,
    "",
    "## Summary",
    analysis.summary,
    "",
    "## Strengths",
    ...analysis.strengths.map((item) => `- ${item}`),
    "",
    "## Weaknesses",
    ...analysis.weaknesses.map((item) => `- ${item}`),
    "",
    "## Suggestions",
    ...analysis.suggestions.map((item) => `- ${item}`),
    "",
    "## Metrics",
    `- Repositories: ${analysis.metrics.totalRepos}`,
    `- Stars: ${analysis.metrics.totalStars}`,
    `- Followers: ${analysis.metrics.followerCount}`,
    `- Following: ${analysis.metrics.followingCount}`,
    `- Top Language: ${analysis.metrics.topLanguages[0]?.name ?? "N/A"}`,
  ].join("\n");
}

function downloadReport(analysis: AnalysisDocumentShape) {
  const content = buildReportContent(analysis);
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const fileName = `${analysis.githubUsername}-analysis-${analysis.id.slice(0, 8)}.md`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export function HistoryList({ analyses }: { analyses: AnalysisDocumentShape[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent analyses</CardTitle>
        <CardDescription>
          Download any report as a Markdown file for sharing or record-keeping.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {analyses.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No recent analyses found yet.</p>
        ) : (
          analyses.map((analysis) => (
            <div
              key={analysis.id}
              className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {analysis.githubUsername}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {formatDate(analysis.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <ScoreBadge score={analysis.hireabilityScore} />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    leftIcon={<Download className="h-4 w-4" />}
                    onClick={() => downloadReport(analysis)}
                  >
                    Download report
                  </Button>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white/5 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Summary</p>
                </div>
                <p className="text-sm leading-6 text-[var(--muted)]">{analysis.summary}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
