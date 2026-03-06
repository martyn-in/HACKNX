import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("reports").order("desc").collect();
    },
});

export const create = mutation({
    args: {
        type: v.string(),
        location: v.string(),
        description: v.string(),
        status: v.string(),
        priority: v.string(),
        user: v.string(),
        time: v.string(),
        lat: v.optional(v.number()),
        lng: v.optional(v.number()),
        photo: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const reportId = await ctx.db.insert("reports", args);
        return reportId;
    },
});

export const updateStatus = mutation({
    args: {
        id: v.id("reports"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { status: args.status });
    },
});
