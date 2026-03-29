"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAppSession } from "@/components/providers/AppSessionProvider";

export function useCurrentUserRecord() {
  const { auth0Id } = useAppSession();
  return useQuery(api.users.getUser, { auth0Id });
}
