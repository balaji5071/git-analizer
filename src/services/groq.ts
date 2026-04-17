import OpenAI from "openai";
import { z } from "zod";

import { appEnv } from "@/lib/env";
import type { AIAnalysisResult, GitHubProfileData } from "@/types/analysis";
import { extractJsonObject } from "@/utils/json";

const aiResponseSchema = z.object({
  summary: z.string().min(1),
  strengths: z.array(z.string()).min(1),
  weaknesses: z.array(z.string()).min(1),
  suggestions: z.array(z.string()).min(1),
  hireabilityScore: z.number().min(0).max(100),
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

function generateHeuristicAnalysis(profile: GitHubProfileData): AIAnalysisResult {
  const { metrics, user } = profile;
  const languageLabel =
    metrics.topLanguages.map((language) => language.name).join(", ") || "a narrow stack";
  const repoDepth = metrics.totalRepos >= 15 ? "strong" : "developing";
  const starSignal = metrics.totalStars >= 25 ? "external validation" : "limited public validation";
  const hireabilityScore = Math.max(
    35,
    Math.min(
      96,
      Math.round(
        metrics.totalRepos * 1.8 +
          metrics.totalStars * 0.7 +
          metrics.topLanguages.length * 6 +
          Math.min(metrics.followerCount, 40) * 0.4,
      ),
    ),
  );

  return {
    summary: `${user.username} shows ${repoDepth} repository depth with ${starSignal} and meaningful experience across ${languageLabel}.`,
    strengths: [
      `Maintains ${metrics.totalRepos} public repositories, signaling consistent output.`,
      `Has accumulated ${metrics.totalStars} total stars across public work.`,
      `Demonstrates breadth across ${metrics.topLanguages.length || 1} primary language areas.`,
    ],
    weaknesses: [
      "Project documentation quality could not be deeply verified from repository metadata alone.",
      "Private work, team collaboration patterns, and code review habits are not visible in public GitHub signals.",
      metrics.totalStars < 10
        ? "Open source traction is still emerging compared with highly visible candidates."
        : "Some repositories may benefit from stronger portfolio storytelling and clearer business impact.",
    ],
    suggestions: [
      "Pin the strongest repositories with clear README files, screenshots, and architecture notes.",
      "Highlight measurable outcomes such as adoption, deployment scale, or technical complexity in repository descriptions.",
      "Add tests, CI badges, and contribution guides to strengthen recruiter confidence during screening.",
    ],
    hireabilityScore,
    source: "heuristic",
  };
}

export async function generateProfileAnalysis(
  profile: GitHubProfileData,
): Promise<AIAnalysisResult> {
  const client = getGroqClient();

  if (!client) {
    return generateHeuristicAnalysis(profile);
  }

  const prompt = [
    "Analyze this GitHub profile:",
    `Repos: ${profile.metrics.totalRepos}`,
    `Stars: ${profile.metrics.totalStars}`,
    `Languages: ${
      profile.metrics.topLanguages.map((language) => language.name).join(", ") || "None"
    }`,
    "",
    "Return strict JSON with these keys:",
    "summary",
    "strengths",
    "weaknesses",
    "suggestions",
    "hireabilityScore",
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
              "You are an expert technical recruiter. Respond with valid JSON only and do not wrap the response in markdown.",
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
      source: "groq",
    };
  } catch {
    return generateHeuristicAnalysis(profile);
  }
}
