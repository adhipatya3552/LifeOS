import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for the LifeOS personal AI agent.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
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
          Terms of use
        </h1>
        <div
          className="space-y-4 text-base leading-relaxed"
          style={{ color: "var(--color-text-muted)" }}
        >
          <p>
            LifeOS is provided as a personal / experimental AI assistant that can
            read and write data in Google services you explicitly connect.
          </p>
          <p>
            You are responsible for the Google accounts you connect, the prompts
            you send, and any emails, calendar events, or documents the agent
            creates when you approve or allow those actions.
          </p>
          <p>
            The service is offered without warranties of uninterrupted
            availability or perfect accuracy. AI outputs can be wrong — review
            sensitive actions before approving them.
          </p>
          <p>
            Google&apos;s terms and OAuth policies also apply to the APIs you
            authorize. LifeOS does not claim to be a Google product.
          </p>
          <p>
            If you host your own instance, these terms apply to that operator&apos;s
            deployment unless they publish different terms.
          </p>
        </div>
      </div>
    </div>
  );
}
