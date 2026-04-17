import { connectToDatabase } from "@/lib/mongoose";
import { Analysis } from "@/models/Analysis";
import { getGitHubProfile } from "@/services/github";
import { generateProfileAnalysis } from "@/services/groq";
import type { AnalysisDocumentShape } from "@/types/analysis";
import type { SessionUser } from "@/types/auth";
import { normalizeGitHubProfileSummary } from "@/utils/analysis";

export async function analyzeGitHubProfile(
  githubUsername: string,
  currentUser: SessionUser,
): Promise<AnalysisDocumentShape> {
  await connectToDatabase();

  const profile = await getGitHubProfile(githubUsername);
  const analysis = await generateProfileAnalysis(profile);

  const analysisPayload = {
    userId: currentUser.id,
    requestedByRole: currentUser.role,
    githubUsername: profile.user.username,
    githubProfile: profile.user,
    metrics: profile.metrics,
    summary: analysis.summary,
    strengths: analysis.strengths,
    weaknesses: analysis.weaknesses,
    suggestions: analysis.suggestions,
    hireabilityScore: analysis.hireabilityScore,
    source: analysis.source,
  };

  let savedAnalysis;

  try {
    savedAnalysis = await Analysis.create(analysisPayload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (!message.toLowerCase().includes("source")) {
      throw error;
    }

    // Fallback keeps analyze available if a stale enum definition rejects provider labels.
    savedAnalysis = await Analysis.create({
      ...analysisPayload,
      source: "heuristic",
    });
  }

  return {
    id: savedAnalysis._id.toString(),
    githubUsername: savedAnalysis.githubUsername,
    requestedByRole: savedAnalysis.requestedByRole,
    createdAt: savedAnalysis.createdAt.toISOString(),
    githubProfile: normalizeGitHubProfileSummary(savedAnalysis.githubProfile),
    metrics: savedAnalysis.metrics,
    summary: savedAnalysis.summary,
    strengths: savedAnalysis.strengths,
    weaknesses: savedAnalysis.weaknesses,
    suggestions: savedAnalysis.suggestions,
    hireabilityScore: savedAnalysis.hireabilityScore,
    source: savedAnalysis.source,
  };
}
