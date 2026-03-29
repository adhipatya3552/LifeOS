import { fetchMutation, fetchQuery } from "convex/nextjs";
import type { FunctionReference } from "convex/server";
import { isConfiguredConvexUrl } from "@/lib/convex-env";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export async function queryConvex<Query extends FunctionReference<"query">>(
  query: Query,
  args: Query["_args"]
): Promise<Query["_returnType"] | null> {
  if (!isConfiguredConvexUrl(convexUrl)) {
    return null;
  }

  return await fetchQuery(query, args);
}

export async function mutateConvex<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
  args: Mutation["_args"]
): Promise<Mutation["_returnType"] | null> {
  if (!isConfiguredConvexUrl(convexUrl)) {
    return null;
  }

  return await fetchMutation(mutation, args);
}
