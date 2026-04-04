import Link from "next/link";
import { notFound } from "next/navigation";
import { GoogleServiceIcon } from "@/components/google/GoogleServiceIcon";
import { getGoogleServiceConfig } from "@/lib/google-service-registry";

export default async function ServiceAuthorizePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  const config = getGoogleServiceConfig(service);

  if (!config) {
    notFound();
  }

  return (
    <div className="flex h-full min-w-0 flex-col overflow-y-auto overflow-x-clip">
      <div
        className="page-header px-4 py-6 sm:px-8"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h1 className="mb-1 text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          {config.title}
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>{config.description}</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
        <div
          className="w-full max-w-2xl rounded-3xl p-6 sm:p-8"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 20px 60px rgba(15,23,42,0.28)",
          }}
        >
          <div className="mb-6 flex items-center justify-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: config.bg,
                border: `1px solid ${config.border}`,
              }}
            >
              <GoogleServiceIcon service={config.id} className="h-9 w-9" />
            </div>
            <div
              className="flex h-3 w-3 items-center justify-center rounded-full"
              style={{ background: "rgba(148,163,184,0.5)" }}
            />
            <div className="flex h-16 min-w-[120px] items-center justify-center rounded-2xl gradient-primary px-4">
              <span className="text-lg font-semibold text-white">LifeOS</span>
            </div>
          </div>

          <div className="mx-auto max-w-xl text-center">
            <h2
              className="mb-3 text-2xl font-semibold"
              style={{ color: "var(--color-text)" }}
            >
              {config.title}
            </h2>
            <p className="mb-6 text-sm sm:text-base" style={{ color: "var(--color-text-muted)" }}>
              Review what LifeOS will be able to do with this {config.shortName} connection.
              You will be redirected to Google to complete authorization.
            </p>
          </div>

          <div className="mx-auto mb-8 max-w-xl space-y-3">
            {config.permissionBullets.map((permission) => (
              <div
                key={permission}
                className="rounded-2xl px-4 py-3 text-sm sm:px-5"
                style={{
                  background: "var(--color-surface-2)",
                  border: `1px solid ${config.border}`,
                  color: "var(--color-text)",
                }}
              >
                {permission}
              </div>
            ))}
          </div>

          <div className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
            <form method="post" action={`/api/connections/google/${config.id}/connect`} className="flex-1">
              <button
                type="submit"
                className="w-full rounded-2xl px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.01]"
                style={{
                  background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)`,
                  boxShadow: `0 16px 40px ${config.color}30`,
                }}
              >
                Authorize
              </button>
            </form>
            <Link
              href="/connections"
              className="flex flex-1 items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-200 hover:opacity-85"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-muted)",
              }}
            >
              Cancel / Deny
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
