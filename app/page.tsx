import { redirect } from "next/navigation";
import { LandingPageClient } from "@/components/marketing/LandingPageClient";
import { auth0 } from "@/lib/auth0";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const session = await auth0.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return <LandingPageClient />;
}
