import OpenAI from "openai";
import { z } from "zod";

import { appEnv } from "@/lib/env";
import type { AIAnalysisResult, GitHubProfileData } from "@/types/analysis";
import { extractJsonObject } from "@/utils/json";

const aiResponseSchema = z.object({
  summary: z.string().min(1),
  strengths: z.array(z.string()).min(3).max(5),
  weaknesses: z.array(z.string()).min(2).max(4),
  suggestions: z.array(z.string()).min(3).max(5),
});

let groqClient: OpenAI | null = null;
const GROQ_REQUEST_TIMEOUT_MS = 15000;

function getGroqClient() {
  if (!appEnv.groqApiKey) {
    return null;
  }

  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey: appEnv.groqApiKey,
      baseURL: appEnv.groqApiBaseUrl,
    });
  }

  return groqClient;
}

function getMessageText(
  content: OpenAI.Chat.Completions.ChatCompletionMessage["content"] | null | undefined,
) {
  return typeof content === "string" ? content : "";
}

function computeActivityStatus(profile: GitHubProfileData) {
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const recentlyUpdated = profile.repos.filter(
    (repo) => new Date(repo.updatedAt).getTime() >= ninetyDaysAgo,
  ).length;

  if (recentlyUpdated >= 6) {
    return "high";
  }

  if (recentlyUpdated >= 2) {
    return "moderate";
  }

  return "low";
}

function estimateReadmeCoverage(profile: GitHubProfileData) {
  if (profile.repos.length === 0) {
    return 0;
  }

  // README files are not fetched from GitHub API in this flow, so we use docs signals as a proxy.
  const reposWithDocsSignal = profile.repos.filter(
    (repo) => Boolean(repo.description?.trim()) || Boolean(repo.homepage?.trim()),
  ).length;

  return Math.round((reposWithDocsSignal / profile.repos.length) * 100);
}

function calculateHireabilityScore(profile: GitHubProfileData) {
  const { metrics } = profile;
  const activityMultiplier =
    computeActivityStatus(profile) === "high"
      ? 1
      : computeActivityStatus(profile) === "moderate"
        ? 0.7
        : 0.4;
  const docsSignal = estimateReadmeCoverage(profile);

  return Math.max(
    35,
    Math.min(
      96,
      Math.round(
        metrics.totalRepos * 1.6 +
          metrics.totalStars * 0.7 +
          metrics.topLanguages.length * 6 +
          Math.min(metrics.followerCount, 40) * 0.35 +
          docsSignal * 0.18 +
          activityMultiplier * 8,
      ),
    ),
  );
}

function getScoreBand(score: number) {
  if (score >= 75) {
    return {
      level: "strong",
      readiness: "ready",
    };
  }

  if (score >= 55) {
    return {
      level: "intermediate",
      readiness: "needs improvement",
    };
  }

  return {
    level: "beginner",
    readiness: "not ready",
  };
}

function normalizeSummary(summary: string) {
  return summary
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 4)
    .join("\n");
}

function generateHeuristicAnalysis(profile: GitHubProfileData): AIAnalysisResult {
  const { metrics, user } = profile;
  const calculatedScore = calculateHireabilityScore(profile);
  const { level, readiness } = getScoreBand(calculatedScore);
  const activityStatus = computeActivityStatus(profile);
  const readmeCoverage = estimateReadmeCoverage(profile);
  const languageLabel =
    metrics.topLanguages.map((language) => language.name).join(", ") || "a narrow stack";
  const repoDepth = metrics.totalRepos >= 15 ? "solid" : "developing";
  const starSignal = metrics.totalStars >= 25 ? "clear external validation" : "early external validation";

  return {
    summary: [
      `${user.username} is at a ${level} level based on public GitHub signals and a calculated score of ${calculatedScore}/100.`,
      `Hiring readiness is ${readiness}, with portfolio evidence showing ${repoDepth} repository depth and ${starSignal}.`,
      `Priority improvement directions are stronger repository documentation (current proxy coverage ${readmeCoverage}%) and more consistent ${activityStatus} contribution momentum.`,
    ].join("\n"),
    strengths: [
      `Maintains ${metrics.totalRepos} public repositories, signaling consistent output.`,
      `Has accumulated ${metrics.totalStars} total stars across public work.`,
      `Demonstrates breadth across ${metrics.topLanguages.length || 1} primary language areas (${languageLabel}).`,
    ],
    weaknesses: [
      "Project documentation quality is inferred from metadata and not direct README inspection, so clarity may still be uneven.",
      `Recent activity trend appears ${activityStatus}, which may reduce confidence in current delivery pace.`,
      metrics.totalStars < 10
        ? "Open source traction is still emerging compared with highly visible candidates."
        : "Some repositories may benefit from stronger portfolio storytelling and clearer business impact.",
    ],
    suggestions: [
      "Standardize top repositories with README sections for problem, architecture, setup, and measurable outcomes.",
      "Pin 3-4 strongest projects and add screenshots, demo links, and explicit impact metrics in descriptions.",
      "Increase visible contribution consistency through regular commits and maintenance updates across core repositories.",
      "Add tests, CI badges, and contribution notes to improve engineering quality confidence during screening.",
    ],
    hireabilityScore: calculatedScore,
    source: "heuristic",
  };
}

export async function generateProfileAnalysis(
  profile: GitHubProfileData,
): Promise<AIAnalysisResult> {
  const client = getGroqClient();
  const calculatedScore = calculateHireabilityScore(profile);
  const activityStatus = computeActivityStatus(profile);
  const readmeCoverage = estimateReadmeCoverage(profile);
  const languages =
    profile.metrics.topLanguages.map((language) => language.name).join(", ") || "None";

  if (!client) {
    return generateHeuristicAnalysis(profile);
  }

  const prompt = [
    "You are an expert technical recruiter and senior software engineer.",
    "Analyze the following GitHub profile data and generate a structured evaluation report.",
    "",
    "INPUT DATA:",
    `- Total Repositories: ${profile.metrics.totalRepos}`,
    `- Total Stars: ${profile.metrics.totalStars}`,
    `- Activity Status: ${activityStatus}`,
    `- Languages Used: ${languages}`,
    `- README Coverage: ${readmeCoverage}% (proxy based on repo description/homepage metadata)` ,
    `- Calculated Score: ${calculatedScore} (out of 100)`,
    "",
    "TASK:",
    "1. Strengths (3-5 bullet points)",
    "2. Weaknesses (2-4 bullet points)",
    "3. Suggestions for improvement (3-5 actionable points)",
    "4. Summary must include evaluation + hiring readiness + improvement direction.",
    "",
    "SUMMARY RULES:",
    "- Clearly state overall level (beginner / intermediate / strong).",
    "- Indicate hiring readiness (ready / needs improvement / not ready).",
    "- Mention 1-2 key improvement directions.",
    "- Keep it concise (3-4 lines max).",
    "",
    "OUTPUT FORMAT (STRICT JSON):",
    '{"strengths":[],"weaknesses":[],"suggestions":[],"summary":""}',
    "",
    "IMPORTANT:",
    "- Do not include any extra text outside JSON.",
    "- Do not hallucinate data.",
    "- Keep tone professional and recruiter-like.",
  ].join("\n");

  try {
    const completion = await Promise.race([
      client.chat.completions.create({
        model: appEnv.groqModel,
        temperature: 0.2,
        top_p: 0.95,
        max_tokens: 700,
        messages: [
          {
            role: "system",
            content:
              "You are an expert technical recruiter and senior software engineer. Respond with valid JSON only, no markdown, and use exactly these keys: strengths, weaknesses, suggestions, summary.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
      new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("Groq request timed out"));
        }, GROQ_REQUEST_TIMEOUT_MS);

        timeoutId.unref?.();
      }),
    ]);

    const content = getMessageText(completion.choices[0]?.message?.content);

    if (!content) {
      throw new Error("Groq response did not include a message.");
    }

    const parsed = aiResponseSchema.parse(extractJsonObject(content));

    return {
      ...parsed,
      summary: normalizeSummary(parsed.summary),
      hireabilityScore: calculatedScore,
      source: "groq",
    };
  } catch {
    return generateHeuristicAnalysis(profile);
  }
}
