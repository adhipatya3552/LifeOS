"use client";

import { createContext, useContext } from "react";
import type {
  GoogleServiceId,
  ServiceConnectionSummary,
} from "@/lib/google-service-registry";

export interface AppSessionData {
  auth0Id: string;
  email: string;
  name: string;
  picture?: string;
  connectedServices: GoogleServiceId[];
  serviceConnections: ServiceConnectionSummary[];
}

const AppSessionContext = createContext<AppSessionData | null>(null);

export function AppSessionProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: AppSessionData;
}) {
  return (
    <AppSessionContext.Provider value={initialSession}>
      {children}
    </AppSessionContext.Provider>
  );
}

export function useAppSession() {
  const session = useContext(AppSessionContext);

  if (!session) {
    throw new Error("useAppSession must be used within AppSessionProvider");
  }

  return session;
}
