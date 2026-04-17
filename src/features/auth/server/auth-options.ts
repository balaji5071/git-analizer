import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";

import { appEnv } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";
import type { UserRole } from "@/types/auth";
import { verifyPassword } from "@/utils/password";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function resolveRole(email: string, fallbackRole: UserRole = "individual") {
  return appEnv.adminEmails.includes(email.toLowerCase()) ? "admin" : fallbackRole;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = credentialsSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        await connectToDatabase();

        const user = await User.findOne({
          email: parsedCredentials.data.email.toLowerCase(),
        }).select("+password");

        if (!user?.password) {
          return null;
        }

        const isValidPassword = await verifyPassword(
          parsedCredentials.data.password,
          user.password,
        );

        if (!isValidPassword) {
          return null;
        }

        user.lastLoginAt = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
          role: user.role,
          githubUsername: user.githubUsername ?? null,
        };
      },
    }),
    ...(appEnv.googleClientId && appEnv.googleClientSecret
      ? [
          GoogleProvider({
            clientId: appEnv.googleClientId,
            clientSecret: appEnv.googleClientSecret,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== "google" || !user.email) {
        return true;
      }

      await connectToDatabase();

      const existingUser = await User.findOne({ email: user.email.toLowerCase() });

      if (existingUser) {
        existingUser.googleId = account.providerAccountId;
        existingUser.name = user.name ?? existingUser.name;
        existingUser.image = user.image ?? existingUser.image;
        existingUser.lastLoginAt = new Date();
        await existingUser.save();
        user.id = existingUser._id.toString();
        user.role = existingUser.role;
        user.githubUsername = existingUser.githubUsername ?? null;
        return true;
      }

      const createdUser = await User.create({
        email: user.email.toLowerCase(),
        googleId: account.providerAccountId,
        name: user.name ?? profile?.name,
        image: user.image,
        role: resolveRole(user.email),
        lastLoginAt: new Date(),
      });

      user.id = createdUser._id.toString();
      user.role = createdUser.role;
      user.githubUsername = createdUser.githubUsername ?? null;

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.githubUsername = user.githubUsername ?? null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.githubUsername = token.githubUsername ?? null;
      }

      return session;
    },
  },
};
