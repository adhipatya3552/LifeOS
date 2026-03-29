"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { createContext, useContext } from "react";
import { isConfiguredConvexUrl } from "@/lib/convex-env";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convexEnabled = isConfiguredConvexUrl(convexUrl);
const convex = new ConvexReactClient(
  convexUrl || "https://placeholder.convex.cloud"
);
const ConvexStatusContext = createContext(convexEnabled);

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexStatusContext.Provider value={convexEnabled}>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </ConvexStatusContext.Provider>
  );
}

export function useConvexEnabled() {
  return useContext(ConvexStatusContext);
}
