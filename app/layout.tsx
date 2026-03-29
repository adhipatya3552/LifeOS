import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";

export const metadata: Metadata = {
  title: "LifeOS — Your AI Personal Operating System",
  description:
    "LifeOS is an AI-powered personal life manager. Manage Gmail, Google Calendar, and Drive through natural conversation — securely powered by Auth0 Token Vault.",
  openGraph: {
    title: "LifeOS",
    description: "AI-powered personal life OS",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
