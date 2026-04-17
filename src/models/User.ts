import { model, models, Schema, Types, type Model } from "mongoose";

import type { UserRole } from "@/types/auth";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    resumeText: {
      type: String,
    },
    resumeFileName: {
      type: String,
      trim: true,
    },
    resumeUpdatedAt: {
      type: Date,
    },
    githubUsername: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["recruiter", "individual", "admin"] satisfies UserRole[],
      default: "individual",
    },
    bookmarks: {
      type: [String],
      default: [],
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export interface UserDocument {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  googleId?: string;
  name?: string;
  image?: string;
  phone?: string;
  country?: string;
  resumeText?: string;
  resumeFileName?: string;
  resumeUpdatedAt?: Date;
  githubUsername?: string;
  role: UserRole;
  bookmarks: string[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const User =
  (models.User as Model<UserDocument>) || model<UserDocument>("User", userSchema);
