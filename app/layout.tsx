import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.APP_BASE_URL ||
  "https://life-os-five-iota.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LifeOS — Your AI Personal Operating System",
    template: "%s · LifeOS",
  },
  description:
    "LifeOS is an AI-powered personal life manager. Manage Gmail, Google Calendar, and Drive through natural conversation with Auth0 sign-in, private Google OAuth connections, and human-in-the-loop approvals.",
  keywords: [
    "AI personal assistant",
    "Gmail AI",
    "Google Calendar agent",
    "Google Drive assistant",
    "LifeOS",
    "personal operating system",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LifeOS — AI Personal Operating System",
    description:
      "Ask once. Inbox summarized. Meeting booked. Docs handled — with OAuth you control and approvals when it matters.",
    type: "website",
    url: "/",
    siteName: "LifeOS",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "LifeOS — AI Personal Operating System",
    description:
      "Chat to run Gmail, Calendar, and Drive. Secure OAuth. Human-in-the-loop approvals.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${bodyFont.variable} ${displayFont.variable}`}>
      <body className={`${bodyFont.className} min-h-full flex flex-col antialiased`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
