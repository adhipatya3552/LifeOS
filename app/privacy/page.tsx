import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How LifeOS handles authentication, Google OAuth tokens, and chat data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy">
      <p>
        LifeOS is a personal AI agent for Gmail, Google Calendar, and Google Drive.
        This page explains what we store and why, in plain language.
      </p>
      <h2>Account</h2>
      <p>
        Sign-in is handled by Auth0. We store a profile record (Auth0 subject id,
        email, name, optional picture) in your Convex database so the app can
        identify you across sessions.
      </p>
      <h2>Google connections</h2>
      <p>
        When you connect Gmail, Calendar, or Drive, LifeOS uses direct Google OAuth
        with service-specific scopes. Access and refresh tokens for those
        connections are stored in your private Convex database so the agent can
        act on your behalf and refresh expired tokens. You can reconnect or stop
        using a service at any time from Connections, and you can revoke LifeOS in
        your Google Account permissions.
      </p>
      <h2>Chat and actions</h2>
      <p>
        Conversation messages and agent action logs may be stored so you can
        resume chats and review history. You can disable action audit logging in
        Settings (pending approvals still need temporary storage to work).
      </p>
      <h2>AI providers</h2>
      <p>
        Chat content is sent to the configured model provider (OpenRouter by
        default) to generate replies and decide which tools to call. Do not send
        secrets you would not entrust to that provider.
      </p>
      <h2>Contact</h2>
      <p>
        For privacy questions about your own deployment, contact the project
        operator who hosts this instance.
      </p>
    </LegalShell>
  );
}

function LegalShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen px-4 py-12 sm:px-6"
      style={{ background: "var(--color-bg)", color: "var(--color-text)" }}
    >
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-sm font-medium"
          style={{ color: "var(--color-primary-light)" }}
        >
          ← LifeOS
        </Link>
        <h1 className="font-display mt-6 mb-6 text-3xl font-bold sm:text-4xl">
          {title}
        </h1>
        <div
          className="space-y-4 text-base leading-relaxed [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold"
          style={{ color: "var(--color-text-muted)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
