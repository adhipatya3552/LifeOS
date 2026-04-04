import { redirect } from "next/navigation";
import { getGoogleServiceConfig } from "@/lib/google-service-registry";

/**
 * This page is no longer the callback target for the Google OAuth flow.
 * The new flow redirects directly to /connections after token exchange.
 * This page is kept as a fallback in case someone navigates here directly.
 */
export const dynamic = "force-dynamic";

export default async function ServiceCompletePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  const config = getGoogleServiceConfig(service);

  if (!config) {
    redirect("/connections?status=error&message=Unknown%20service%20requested.");
  }

  // Redirect to the Connection Hub — the real completion happens in the callback
  redirect(`/connections?status=error&message=Connection+could+not+be+completed+via+this+page.+Please+reconnect+from+the+Connection+Hub.`);
}
