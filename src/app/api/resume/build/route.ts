import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/lib/mongoose";
import { Analysis } from "@/models/Analysis";
import { User } from "@/models/User";
import { buildAtsResume } from "@/services/resume";

const resumeSchema = z.object({
  jobDescription: z.string().trim().min(80).max(10000),
  existingResume: z.string().trim().min(120).max(30000).optional(),
});

const MAX_RESUME_FILE_BYTES = 5 * 1024 * 1024;

async function extractResumeTextFromFile(file: File) {
  const fileType = (file.type || "").toLowerCase();
  const fileName = file.name.toLowerCase();

  if (file.size > MAX_RESUME_FILE_BYTES) {
    throw new Error("Resume file is too large. Maximum size is 5MB.");
  }

  const isPdf = fileType === "application/pdf" || fileName.endsWith(".pdf");
  const isDocx =
    fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx");

  if (!isPdf && !isDocx) {
    throw new Error("Please upload a PDF or DOCX resume file.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (isPdf) {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = pdfParseModule.default;
    const parsed = await pdfParse(buffer);
    return parsed.text.trim();
  }

  const mammothModule = await import("mammoth");
  const result = await mammothModule.extractRawText({ buffer });
  return result.value.trim();
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "individual") {
      return NextResponse.json(
        { error: "ATS resume builder is only available to individual users." },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const body = {
      jobDescription: formData.get("jobDescription"),
      existingResume: formData.get("existingResume"),
    };
    const resumeFileValue = formData.get("resumeFile");
    const resumeFile = resumeFileValue instanceof File ? resumeFileValue : null;

    const extractedResumeText = resumeFile
      ? await extractResumeTextFromFile(resumeFile)
      : undefined;

    const parsedBody = resumeSchema.safeParse(
      typeof body === "object" && body !== null
        ? (body as { jobDescription?: unknown; existingResume?: unknown })
        : undefined,
    );

    if (!parsedBody.success || (!parsedBody.data.existingResume && !extractedResumeText)) {
      return NextResponse.json(
        {
          error:
            "Please provide a detailed job description and either paste your resume text or upload a PDF/DOCX file.",
          issues: parsedBody.success ? undefined : parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    const existingResume = (extractedResumeText ?? parsedBody.data.existingResume ?? "").trim();

    if (existingResume.length < 120) {
      return NextResponse.json(
        {
          error:
            "Resume content is too short after extraction. Please upload a clearer file or paste full resume text.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const [user, latestAnalysis] = await Promise.all([
      User.findById(session.user.id),
      Analysis.findOne({ userId: session.user.id }).sort({ createdAt: -1 }),
    ]);

    const resume = await buildAtsResume(
      parsedBody.data.jobDescription,
      existingResume,
      {
        name: user?.name ?? session.user.name,
        email: user?.email ?? session.user.email,
        githubUsername: user?.githubUsername ?? session.user.githubUsername,
        latestSummary: latestAnalysis?.summary ?? null,
        latestStrengths: latestAnalysis?.strengths ?? [],
        topLanguages:
          latestAnalysis?.metrics.topLanguages?.map((language) => language.name) ?? [],
      },
    );

    return NextResponse.json({ resume }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to build ATS resume right now.",
      },
      { status: 500 },
    );
  }
}
