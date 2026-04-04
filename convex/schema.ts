import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    auth0Id: v.string(),
    email: v.string(),
    name: v.string(),
    picture: v.optional(v.string()),
    connectedServices: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_auth0Id", ["auth0Id"]),

  serviceConnections: defineTable({
    userId: v.id("users"),
    service: v.union(
      v.literal("gmail"),
      v.literal("calendar"),
      v.literal("drive")
    ),
    provider: v.literal("google"),
    auth0Connection: v.string(),
    status: v.union(
      v.literal("connected"),
      v.literal("error"),
      v.literal("revoked")
    ),
    accountEmail: v.optional(v.string()),
    accountName: v.optional(v.string()),
    accountPicture: v.optional(v.string()),
    scopes: v.array(v.string()),
    // Direct Google OAuth tokens (replaces Auth0 Token Vault)
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
    connectedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_service", ["userId", "service"]),

  conversations: defineTable({
    userId: v.id("users"),
    title: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    messageKey: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_messageKey", ["conversationId", "messageKey"]),

  agentActions: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Persisted Settings page preferences
  userSettings: defineTable({
    userId: v.id("users"),
    autoApproveLowRisk: v.boolean(),
    requireApprovalAll: v.boolean(),
    stepUpAuth: v.boolean(),
    auditLog: v.boolean(),
    actionNotifications: v.boolean(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
});
