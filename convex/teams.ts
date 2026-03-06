import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("teams").collect();
    },
});

export const add = mutation({
    args: {
        name: v.string(),
        status: v.string(),
        color: v.string(),
    },
    handler: async (ctx, args) => {
        try {
            const teamId = await ctx.db.insert("teams", args);
            console.log("Team added successfully:", teamId);
            return teamId;
        } catch (error) {
            console.error("Failed to add team:", error);
            throw new Error(`Failed to add team: ${error.message}`);
        }
    },
});

export const updateStatus = mutation({
    args: {
        id: v.id("teams"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { status: args.status });
    },
});

export const remove = mutation({
    args: { id: v.id("teams") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
