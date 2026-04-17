import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";
import { hashPassword, verifyPassword } from "@/utils/password";

const settingsSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  phone: z.string().trim().max(24).optional().or(z.literal("")),
  country: z.string().trim().max(64).optional().or(z.literal("")),
  currentPassword: z.string().max(128).optional().or(z.literal("")),
  newPassword: z.string().min(8).max(128).optional().or(z.literal("")),
  resumeText: z.string().max(120000).optional().or(z.literal("")),
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
  const isText = fileType === "text/plain" || fileName.endsWith(".txt");

  if (!isPdf && !isDocx && !isText) {
    throw new Error("Please upload PDF, DOCX, or TXT for resume.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (isPdf) {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = pdfParseModule.default;
    const parsed = await pdfParse(buffer);
    return parsed.text.trim();
  }

  if (isDocx) {
    const mammothModule = await import("mammoth");
    const result = await mammothModule.extractRawText({ buffer });
    return result.value.trim();
  }

  return buffer.toString("utf8").trim();
}

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        profile: {
          name: user.name ?? "",
          email: user.email,
          phone: user.phone ?? "",
          country: user.country ?? "",
          resumeFileName: user.resumeFileName ?? "",
          resumeUpdatedAt: user.resumeUpdatedAt?.toISOString() ?? null,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load settings profile.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      country: formData.get("country"),
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      resumeText: formData.get("resumeText"),
    };
    const resumeFileValue = formData.get("resumeFile");
    const resumeFile = resumeFileValue instanceof File ? resumeFileValue : null;

    const parsedBody = settingsSchema.safeParse(payload);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Please provide valid settings values.",
          issues: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id).select("+password");

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const nextEmail = parsedBody.data.email.toLowerCase();
    const emailChanged = user.email !== nextEmail;
    const wantsPasswordChange = Boolean(parsedBody.data.newPassword);

    if (emailChanged) {
      const duplicate = await User.findOne({
        email: nextEmail,
        _id: { $ne: user._id },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "Another account already uses that email." },
          { status: 409 },
        );
      }
    }

    if (emailChanged || wantsPasswordChange) {
      if (user.password) {
        const providedCurrentPassword = parsedBody.data.currentPassword?.trim();

        if (!providedCurrentPassword) {
          return NextResponse.json(
            { error: "Current password is required to change email or password." },
            { status: 400 },
          );
        }

        const validCurrentPassword = await verifyPassword(
          providedCurrentPassword,
          user.password,
        );

        if (!validCurrentPassword) {
          return NextResponse.json(
            { error: "Current password is incorrect." },
            { status: 400 },
          );
        }
      }

      if (wantsPasswordChange) {
        user.password = await hashPassword(parsedBody.data.newPassword!.trim());
      }
    }

    const extractedResume = resumeFile
      ? await extractResumeTextFromFile(resumeFile)
      : undefined;

    user.name = parsedBody.data.name.trim();
    user.email = nextEmail;
    user.phone = parsedBody.data.phone?.trim() || undefined;
    user.country = parsedBody.data.country?.trim() || undefined;

    const nextResumeText = extractedResume ?? parsedBody.data.resumeText?.trim();

    if (nextResumeText) {
      user.resumeText = nextResumeText;
      user.resumeUpdatedAt = new Date();
      if (resumeFile) {
        user.resumeFileName = resumeFile.name;
      }
    }

    await user.save();

    return NextResponse.json(
      {
        profile: {
          name: user.name ?? "",
          email: user.email,
          phone: user.phone ?? "",
          country: user.country ?? "",
          resumeFileName: user.resumeFileName ?? "",
          resumeUpdatedAt: user.resumeUpdatedAt?.toISOString() ?? null,
        },
        message:
          emailChanged || wantsPasswordChange
            ? "Settings updated. Please sign in again if your session email/password changed."
            : "Settings updated successfully.",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to update settings profile.",
      },
      { status: 500 },
    );
  }
}
