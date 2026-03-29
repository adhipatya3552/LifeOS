import { redirect } from "next/navigation";
import { ProtectedShell } from "@/components/layout/ProtectedShell";
import {
  AppSessionProvider,
  type AppSessionData,
} from "@/components/providers/AppSessionProvider";
import { auth0 } from "@/lib/auth0";
import { ensureCurrentUserProfile } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const initialSession = (await ensureCurrentUserProfile(
    session.user
  )) satisfies AppSessionData;

  return (
    <AppSessionProvider initialSession={initialSession}>
      <ProtectedShell>{children}</ProtectedShell>
    </AppSessionProvider>
  );
}
