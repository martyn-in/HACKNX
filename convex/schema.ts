import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    reports: defineTable({
        type: v.string(),
        location: v.string(),
        description: v.string(),
        status: v.string(), // "pending", "investigating", "resolved"
        priority: v.string(), // "high", "medium", "low"
        user: v.string(),
        time: v.string(), // ISO timestamp
        lat: v.optional(v.number()),
        lng: v.optional(v.number()),
        photo: v.optional(v.string()), // Base64 or URL
    }).index("by_time", ["time"]),
    teams: defineTable({
        name: v.string(),
        status: v.string(), // "Available", "On Site", "Offline"
        color: v.string(), // Tailwind color class e.g., "bg-primary"
    }),
    waterData: defineTable({
        day: v.string(),         // e.g. "Mon", "Tue"
        usage: v.number(),       // gallons consumed
        qualityScore: v.number(),// 0-100 water quality score
        recordedAt: v.string(),  // ISO timestamp
    }).index("by_recordedAt", ["recordedAt"]),
});
