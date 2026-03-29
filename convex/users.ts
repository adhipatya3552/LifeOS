import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertUser = mutation({
  args: {
    auth0Id: v.string(),
    email: v.string(),
    name: v.string(),
    picture: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        picture: args.picture,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      auth0Id: args.auth0Id,
      email: args.email,
      name: args.name,
      picture: args.picture,
      connectedServices: [],
      createdAt: Date.now(),
    });
  },
});

export const getUser = query({
  args: { auth0Id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();
  },
});

export const updateConnectedServices = mutation({
  args: {
    auth0Id: v.string(),
    services: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();

    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { connectedServices: args.services });
  },
});

export const getUserConnectedServices = query({
  args: { auth0Id: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();

    return user?.connectedServices || [];
  },
});
