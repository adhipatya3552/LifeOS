import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";

const serviceValidator = v.union(
  v.literal("gmail"),
  v.literal("calendar"),
  v.literal("drive")
);

const statusValidator = v.union(
  v.literal("connected"),
  v.literal("error"),
  v.literal("revoked")
);

async function syncConnectedServicesForUser(
  ctx: MutationCtx,
  userId: Id<"users">
) {
  const connections = await ctx.db
    .query("serviceConnections")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  const connectedServices = connections
    .filter((connection) => connection.status === "connected")
    .map((connection) => connection.service);

  await ctx.db.patch(userId, {
    connectedServices,
  });
}

export const listByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("serviceConnections")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const listByAuth0Id = query({
  args: { auth0Id: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("serviceConnections")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const upsertServiceConnection = mutation({
  args: {
    userId: v.id("users"),
    service: serviceValidator,
    provider: v.literal("google"),
    auth0Connection: v.string(),
    status: statusValidator,
    accountEmail: v.optional(v.string()),
    accountName: v.optional(v.string()),
    accountPicture: v.optional(v.string()),
    scopes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("serviceConnections")
      .withIndex("by_userId_and_service", (q) =>
        q.eq("userId", args.userId).eq("service", args.service)
      )
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        provider: args.provider,
        auth0Connection: args.auth0Connection,
        status: args.status,
        accountEmail: args.accountEmail,
        accountName: args.accountName,
        accountPicture: args.accountPicture,
        scopes: args.scopes,
        connectedAt: args.status === "connected" ? now : existing.connectedAt,
        updatedAt: now,
      });

      await syncConnectedServicesForUser(ctx, args.userId);
      return existing._id;
    }

    const connectionId = await ctx.db.insert("serviceConnections", {
      userId: args.userId,
      service: args.service,
      provider: args.provider,
      auth0Connection: args.auth0Connection,
      status: args.status,
      accountEmail: args.accountEmail,
      accountName: args.accountName,
      accountPicture: args.accountPicture,
      scopes: args.scopes,
      connectedAt: args.status === "connected" ? now : undefined,
      updatedAt: now,
    });

    await syncConnectedServicesForUser(ctx, args.userId);
    return connectionId;
  },
});
