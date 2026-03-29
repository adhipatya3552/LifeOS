import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    messageKey: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("messages")
      .withIndex("by_conversation_messageKey", (q) =>
        q.eq("conversationId", args.conversationId).eq("messageKey", args.messageKey)
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      messageKey: args.messageKey,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const listMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();
  },
});
