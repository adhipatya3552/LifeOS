import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_SETTINGS = {
  autoApproveLowRisk: true,
  requireApprovalAll: false,
  stepUpAuth: true,
  auditLog: true,
  actionNotifications: true,
};

export const getSettings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    // Return defaults merged with stored values
    return {
      ...DEFAULT_SETTINGS,
      ...settings,
    };
  },
});

export const upsertSettings = mutation({
  args: {
    userId: v.id("users"),
    autoApproveLowRisk: v.optional(v.boolean()),
    requireApprovalAll: v.optional(v.boolean()),
    stepUpAuth: v.optional(v.boolean()),
    auditLog: v.optional(v.boolean()),
    actionNotifications: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...patch } = args;

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...patch,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("userSettings", {
      userId,
      autoApproveLowRisk: patch.autoApproveLowRisk ?? DEFAULT_SETTINGS.autoApproveLowRisk,
      requireApprovalAll: patch.requireApprovalAll ?? DEFAULT_SETTINGS.requireApprovalAll,
      stepUpAuth: patch.stepUpAuth ?? DEFAULT_SETTINGS.stepUpAuth,
      auditLog: patch.auditLog ?? DEFAULT_SETTINGS.auditLog,
      actionNotifications: patch.actionNotifications ?? DEFAULT_SETTINGS.actionNotifications,
      updatedAt: now,
    });
  },
});
