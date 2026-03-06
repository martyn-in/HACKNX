import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("waterData").withIndex("by_recordedAt").collect();
    },
});

export const add = mutation({
    args: {
        day: v.string(),
        usage: v.number(),
        qualityScore: v.number(),
        recordedAt: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("waterData", args);
    },
});

export const remove = mutation({
    args: { id: v.id("waterData") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
