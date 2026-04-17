import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Providers } from "@/components/common/providers";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Eutian Ai",
  description:
    "A role-based SaaS platform for recruiters, developers, and admins to evaluate GitHub profiles with AI.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={inter.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
