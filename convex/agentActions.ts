import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const logAction = mutation({
  args: {
    userId: v.id("users"),
    conversationId: v.optional(v.id("conversations")),
    service: v.union(
      v.literal("gmail"),
      v.literal("calendar"),
      v.literal("drive")
    ),
    toolName: v.string(),
    actionType: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("pending_approval"),
      v.literal("approved"),
      v.literal("success"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    input: v.any(),
    result: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agentActions", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const listActions = query({
  args: {
    userId: v.id("users"),
    service: v.optional(
      v.union(
        v.literal("gmail"),
        v.literal("calendar"),
        v.literal("drive")
      )
    ),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("agentActions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc");

    const results = await query.collect();

    if (args.service) {
      return results.filter((a) => a.service === args.service);
    }

    return results;
  },
});

export const getAction = query({
  args: {
    actionId: v.id("agentActions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.actionId);
  },
});

export const updateActionStatus = mutation({
  args: {
    actionId: v.id("agentActions"),
    status: v.union(
      v.literal("pending_approval"),
      v.literal("approved"),
      v.literal("success"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    result: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.actionId, {
      status: args.status,
      result: args.result,
      metadata: args.metadata,
      updatedAt: Date.now(),
    });
  },
});
