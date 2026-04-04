"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { useConvexEnabled } from "@/app/ConvexClientProvider";
import { GoogleServiceIcon } from "@/components/google/GoogleServiceIcon";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import { api } from "@/convex/_generated/api";
import {
  GOOGLE_SERVICE_LIST,
  getConnectedServiceIds,
} from "@/lib/google-service-registry";
import { normalizeServiceConnections } from "@/lib/google-service-flow";

function formatConnectedTime(timestamp?: number) {
  if (!timestamp) {
    return "Not yet connected";
  }

  return new Date(timestamp).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

export default function ConnectionsPage() {
  const searchParams = useSearchParams();
  const convexEnabled = useConvexEnabled();
  const {
    auth0Id,
    connectedServices: bootstrappedServices,
    serviceConnections: bootstrappedConnections,
  } = useAppSession();
  const liveConnections = useQuery(
    api.serviceConnections.listByAuth0Id,
    convexEnabled ? { auth0Id } : "skip"
  );

  const serviceConnections = normalizeServiceConnections(
    liveConnections || bootstrappedConnections || []
  );
  const connectedServices = getConnectedServiceIds(serviceConnections);
  const bannerStatus = searchParams.get("status");
  const bannerMessage = searchParams.get("message");
  const bannerService = searchParams.get("service");
  const resolvedConnectedServices =
    connectedServices.length > 0 ? connectedServices : bootstrappedServices;

  return (
    <div className="flex h-full min-w-0 flex-col overflow-y-auto overflow-x-clip">
      <div
        className="page-header px-4 py-6 sm:px-8"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h1 className="mb-1 text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          Connection Hub
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          Connect Gmail, Calendar, and Drive independently. Each service can use a
          different Google account and is only enabled after you approve it.
        </p>
      </div>

      <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
        {bannerStatus && bannerMessage ? (
          <div
            className="flex items-start gap-3 rounded-2xl px-4 py-4 sm:px-5"
            style={{
              background:
                bannerStatus === "connected"
                  ? "rgba(16,185,129,0.1)"
                  : "rgba(239,68,68,0.1)",
              border:
                bannerStatus === "connected"
                  ? "1px solid rgba(16,185,129,0.2)"
                  : "1px solid rgba(239,68,68,0.2)",
              color:
                bannerStatus === "connected"
                  ? "var(--color-success)"
                  : "var(--color-danger)",
            }}
          >
            {bannerStatus === "connected" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            )}
            <div>
              <p className="font-semibold">
                {bannerService
                  ? `${bannerService.charAt(0).toUpperCase()}${bannerService.slice(1)} connection update`
                  : "Connection update"}
              </p>
              <p className="text-sm">{bannerMessage}</p>
            </div>
          </div>
        ) : null}

        <div
          className="flex items-start gap-4 rounded-2xl p-5"
          style={{
            background: "rgba(139,92,246,0.06)",
            border: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ background: "rgba(139,92,246,0.15)" }}
          >
            <Shield className="h-5 w-5" style={{ color: "var(--color-primary-light)" }} />
          </div>
          <div>
            <p className="mb-1 font-semibold" style={{ color: "var(--color-primary-light)" }}>
              Powered by Auth0 Token Vault
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              LifeOS requests tokens for the specific service you connect. Your Gmail,
              Calendar, and Drive permissions stay isolated from one another.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {GOOGLE_SERVICE_LIST.map((service, index) => {
            const connection = serviceConnections.find(
              (entry) => entry.service === service.id
            );
            const isConnected = connection?.status === "connected";
            const isDerivedConnected = resolvedConnectedServices.includes(service.id);
            const displayConnected = isConnected || isDerivedConnected;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
              >
                <div
                  className="flex flex-col gap-5 rounded-2xl p-5 sm:p-6 lg:flex-row lg:items-center lg:gap-6"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl"
                    style={{
                      background: service.bg,
                      border: `1px solid ${service.border}`,
                    }}
                  >
                    <GoogleServiceIcon service={service.id} className="h-8 w-8" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3
                      className="mb-1 text-lg font-semibold"
                      style={{ color: "var(--color-text)" }}
                    >
                      {service.name}
                    </h3>
                    <p className="mb-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
                      {service.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {service.permissionBullets.map((permission) => (
                        <span
                          key={permission}
                          className="rounded-full px-2 py-0.5 text-xs"
                          style={{
                            background: `${service.color}12`,
                            border: `1px solid ${service.color}25`,
                            color: service.color,
                          }}
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 self-stretch lg:min-w-[240px] lg:flex-shrink-0 lg:items-end">
                    <div
                      className="flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-sm lg:self-auto"
                      style={{
                        background: displayConnected
                          ? "rgba(16,185,129,0.1)"
                          : connection?.status === "error"
                            ? "rgba(239,68,68,0.1)"
                            : "rgba(100,116,139,0.1)",
                        border: displayConnected
                          ? "1px solid rgba(16,185,129,0.2)"
                          : connection?.status === "error"
                            ? "1px solid rgba(239,68,68,0.2)"
                            : "1px solid rgba(100,116,139,0.2)",
                        color: displayConnected
                          ? "var(--color-success)"
                          : connection?.status === "error"
                            ? "var(--color-danger)"
                            : "var(--color-text-subtle)",
                      }}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${displayConnected ? "bg-emerald-500" : connection?.status === "error" ? "bg-red-500" : "bg-slate-500"}`}
                      />
                      {displayConnected
                        ? "Connected"
                        : connection?.status === "error"
                          ? "Needs attention"
                          : "Not connected"}
                    </div>

                    <div className="w-full rounded-2xl px-4 py-3 text-sm lg:max-w-[240px]"
                      style={{
                        background: "var(--color-surface-2)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      <p className="truncate font-medium" style={{ color: "var(--color-text)" }}>
                        {connection?.accountEmail || "No Google account connected yet"}
                      </p>
                      <p className="mt-1 text-xs">
                        Last connected: {formatConnectedTime(connection?.connectedAt)}
                      </p>
                    </div>

                    <Link
                      id={`connect-${service.id}-btn`}
                      href={`/connections/${service.id}/authorize`}
                      className="inline-flex items-center justify-center rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200 hover:scale-105 hover:opacity-90"
                      style={{
                        background: `linear-gradient(135deg, ${service.color}cc, ${service.color}99)`,
                        color: "white",
                        boxShadow: `0 0 20px ${service.color}30`,
                      }}
                    >
                      {displayConnected ? "Reconnect" : service.connectButtonLabel}
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
