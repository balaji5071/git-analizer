import OpenAI from "openai";
import { z } from "zod";

import { appEnv } from "@/lib/env";
import type { AtsResumeResult, ResumeProfileContext } from "@/types/resume";
import { extractJsonObject } from "@/utils/json";

const ATS_REQUEST_TIMEOUT_MS = 15000;

const atsResumeSchema = z.object({
  title: z.string().min(1),
  professionalSummary: z.string().min(1),
  coreSkills: z.array(z.string()).min(6).max(16),
  impactBullets: z.array(z.string()).min(3).max(8),
  projectHighlights: z.array(z.string()).min(2).max(6),
  atsKeywords: z.array(z.string()).min(8).max(24),
  detectedMistakes: z.array(z.string()).min(3).max(8),
  changesMade: z.array(z.string()).min(3).max(10),
  remainingGaps: z.array(z.string()).min(1).max(8),
});

let groqClient: OpenAI | null = null;

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

function toPlainTextResume(data: Omit<AtsResumeResult, "plainTextResume">, context: ResumeProfileContext) {
  return [
    `${context.name ?? "Candidate"}`,
    `${context.email ?? ""}${context.githubUsername ? ` | github.com/${context.githubUsername}` : ""}`.trim(),
    "",
    data.title,
    "",
    "PROFESSIONAL SUMMARY",
    data.professionalSummary,
    "",
    "CORE SKILLS",
    ...data.coreSkills.map((skill) => `- ${skill}`),
    "",
    "IMPACT HIGHLIGHTS",
    ...data.impactBullets.map((bullet) => `- ${bullet}`),
    "",
    "PROJECT HIGHLIGHTS",
    ...data.projectHighlights.map((project) => `- ${project}`),
    "",
    "ATS KEYWORDS",
    data.atsKeywords.join(", "),
    "",
    "MISTAKES FOUND",
    ...data.detectedMistakes.map((item) => `- ${item}`),
    "",
    "CHANGES MADE",
    ...data.changesMade.map((item) => `- ${item}`),
    "",
    "REMAINING GAPS",
    ...data.remainingGaps.map((item) => `- ${item}`),
  ]
    .filter(Boolean)
    .join("\n");
}

function extractTokens(input: string) {
  return Array.from(
    new Set(
      input
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((token) => token.length > 3),
    ),
  );
}

function selectJobKeywords(jobDescription: string) {
  const stopWords = new Set([
    "with",
    "that",
    "this",
    "from",
    "your",
    "have",
    "will",
    "role",
    "team",
    "years",
    "experience",
    "ability",
    "strong",
  ]);

  return extractTokens(jobDescription)
    .filter((token) => !stopWords.has(token))
    .slice(0, 18);
}

function buildOptimizationAudit(
  existingResume: string,
  jobDescription: string,
  optimized: {
    professionalSummary: string;
    coreSkills: string[];
    impactBullets: string[];
    projectHighlights: string[];
    atsKeywords: string[];
  },
) {
  const existingTokens = new Set(extractTokens(existingResume));
  const optimizedText = [
    optimized.professionalSummary,
    ...optimized.coreSkills,
    ...optimized.impactBullets,
    ...optimized.projectHighlights,
    ...optimized.atsKeywords,
  ].join(" ");
  const optimizedTokens = new Set(extractTokens(optimizedText));
  const targetKeywords = selectJobKeywords(jobDescription);

  const matchedBefore = targetKeywords.filter((token) => existingTokens.has(token));
  const newlyCovered = targetKeywords.filter(
    (token) => !existingTokens.has(token) && optimizedTokens.has(token),
  );
  const stillMissing = targetKeywords.filter((token) => !optimizedTokens.has(token));

  const detectedMistakes = [
    ...(matchedBefore.length < Math.max(3, Math.floor(targetKeywords.length * 0.4))
      ? [
          "Original resume had weak keyword alignment with the target job description.",
        ]
      : []),
    ...(!/[0-9]/.test(existingResume)
      ? [
          "Original resume had limited quantifiable impact metrics (numbers/results were sparse).",
        ]
      : []),
    ...(existingResume.split("\n").filter((line) => line.trim()).length < 10
      ? [
          "Original resume content was too brief for strong ATS and recruiter evaluation.",
        ]
      : []),
    ...(existingResume.length < 1200
      ? [
          "Original resume likely under-described project scope and outcomes for screening depth.",
        ]
      : []),
  ];

  if (detectedMistakes.length < 3) {
    detectedMistakes.push(
      "Original resume had inconsistent phrasing that could reduce ATS keyword consistency.",
    );
  }

  const changesMade = [
    "Rewrote the professional summary to align directly with target role expectations.",
    "Restructured core skills to prioritize role-relevant technical keywords.",
    "Refined impact bullets to improve clarity and recruiter scanability.",
    ...(newlyCovered.length > 0
      ? [
          `Added or emphasized target keywords: ${newlyCovered.slice(0, 8).join(", ")}.`,
        ]
      : []),
    "Generated an ATS keyword block to increase screening match visibility.",
  ];

  const remainingGaps =
    stillMissing.length > 0
      ? [
          `Consider adding proof-backed experience for these target areas: ${stillMissing
            .slice(0, 8)
            .join(", ")}.`,
        ]
      : ["No major ATS keyword gaps detected for the current job description."];

  return {
    detectedMistakes: detectedMistakes.slice(0, 8),
    changesMade: changesMade.slice(0, 10),
    remainingGaps: remainingGaps.slice(0, 8),
  };
}

function extractResumeSignals(existingResume: string) {
  const lines = existingResume
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const highlightedLines = lines
    .filter((line) => line.length > 40 && line.length < 220)
    .slice(0, 6);

  const tokenPool = lines.join(" ").toLowerCase();
  const resumeKeywords = Array.from(
    new Set(
      tokenPool
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((token) => token.length > 3),
    ),
  ).slice(0, 30);

  return {
    highlightedLines,
    resumeKeywords,
  };
}

function buildHeuristicResume(
  jobDescription: string,
  existingResume: string,
  context: ResumeProfileContext,
): AtsResumeResult {
  const { highlightedLines, resumeKeywords } = extractResumeSignals(existingResume);
  const topLanguages = context.topLanguages?.length
    ? context.topLanguages
    : ["JavaScript", "TypeScript", "Node.js", "React"];

  const coreSkills = [
    ...topLanguages,
    "REST API Development",
    "Database Design",
    "Testing and Debugging",
    "Git and Version Control",
  ].slice(0, 12);

  const impactBullets = [
    ...(highlightedLines.length > 0
      ? highlightedLines.slice(0, 3)
      : [
          "Built and maintained production-grade web features with measurable improvements in reliability and developer velocity.",
          "Translated business requirements into scoped technical deliverables and shipped iteratively.",
          "Improved code quality through testing discipline, code reviews, and pragmatic refactoring.",
        ]),
  ];

  const projectHighlights = [
    context.latestSummary
      ? `Recent profile analysis highlights: ${context.latestSummary}`
      : "Delivered end-to-end full-stack features from design to deployment.",
    "Collaborated across product and engineering functions to prioritize high-impact technical work.",
  ];

  const jobTokens = Array.from(
    new Set(
      jobDescription
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((token) => token.length > 3),
    ),
  ).slice(0, 12);

  const atsKeywords = Array.from(
    new Set([...coreSkills, ...jobTokens, ...resumeKeywords]),
  ).slice(0, 20);

  const resumeDraft = {
    title: "ATS-Optimized Software Engineer Resume",
    professionalSummary:
      "Software engineer with practical full-stack experience, strong delivery habits, and a focus on building maintainable products aligned to job requirements.",
    coreSkills,
    impactBullets,
    projectHighlights,
    atsKeywords,
  };

  const audit = buildOptimizationAudit(existingResume, jobDescription, resumeDraft);

  const resume = {
    ...resumeDraft,
    ...audit,
  };

  return {
    ...resume,
    plainTextResume: toPlainTextResume(resume, context),
  };
}

export async function buildAtsResume(
  jobDescription: string,
  existingResume: string,
  context: ResumeProfileContext,
): Promise<AtsResumeResult> {
  const client = getGroqClient();

  if (!client) {
    return buildHeuristicResume(jobDescription, existingResume, context);
  }

  const prompt = [
    "Rewrite and optimize the candidate's existing resume for the provided job description.",
    "Preserve truthful experience from the existing resume and improve structure, keyword alignment, and clarity for ATS screening.",
    "Return strict JSON only with keys:",
    "title, professionalSummary, coreSkills, impactBullets, projectHighlights, atsKeywords, detectedMistakes, changesMade, remainingGaps",
    "",
    "Candidate context:",
    `Name: ${context.name ?? "N/A"}`,
    `Email: ${context.email ?? "N/A"}`,
    `GitHub: ${context.githubUsername ?? "N/A"}`,
    `Top languages: ${context.topLanguages?.join(", ") ?? "N/A"}`,
    `Recent analysis summary: ${context.latestSummary ?? "N/A"}`,
    `Recent strengths: ${context.latestStrengths?.join("; ") ?? "N/A"}`,
    "",
    "Existing resume:",
    existingResume,
    "",
    "Job description:",
    jobDescription,
  ].join("\n");

  try {
    const completion = await Promise.race([
      client.chat.completions.create({
        model: appEnv.groqModel,
        temperature: 0.2,
        top_p: 0.95,
        max_tokens: 1200,
        messages: [
          {
            role: "system",
            content:
              "You are a senior technical recruiter and software engineer. Output valid JSON only with the requested keys and no markdown. detectedMistakes must explain issues in the original resume, changesMade must explain improvements applied, and remainingGaps must list what still needs evidence for this job.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
      new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("ATS resume request timed out"));
        }, ATS_REQUEST_TIMEOUT_MS);

        timeoutId.unref?.();
      }),
    ]);

    const content = getMessageText(completion.choices[0]?.message?.content);

    if (!content) {
      throw new Error("Model response was empty.");
    }

    const parsed = atsResumeSchema.parse(extractJsonObject(content));

    const mergedAudit = buildOptimizationAudit(existingResume, jobDescription, parsed);
    const enriched = {
      ...parsed,
      detectedMistakes: parsed.detectedMistakes.length > 0 ? parsed.detectedMistakes : mergedAudit.detectedMistakes,
      changesMade: parsed.changesMade.length > 0 ? parsed.changesMade : mergedAudit.changesMade,
      remainingGaps: parsed.remainingGaps.length > 0 ? parsed.remainingGaps : mergedAudit.remainingGaps,
    };

    return {
      ...enriched,
      plainTextResume: toPlainTextResume(enriched, context),
    };
  } catch {
    return buildHeuristicResume(jobDescription, existingResume, context);
  }
}
