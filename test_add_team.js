import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

async function testAddTeam() {
    try {
        console.log("Adding dummy team to VITE_CONVEX_URL:", process.env.VITE_CONVEX_URL);
        const teamId = await client.mutation(api.teams.add, {
            name: "Test Unit Z",
            status: "Available",
            color: "bg-danger"
        });
        console.log("Success! Team added with ID:", teamId);
    } catch (e) {
        console.error("Mutation failed!");
        console.error(e);
    }
}

testAddTeam();
