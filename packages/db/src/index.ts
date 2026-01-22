import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import appConfig from "@delegate/config";

export type { CredentialsI, PropertiesI, CredentialSubmitPayload, UserCredentials, IEdge, INode, Measured, NodeData, Position, Workflow } from "./types/index.js"

const connectionString = appConfig.database.url;
const isProduction = process.env.NODE_ENV === "production" || connectionString.includes("neon.tech");

const pool = new pg.Pool({
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false
});
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

async function connectPrismaClient() {
    try {
        await prisma.$connect()
    } catch (error) {
        console.log("PRISMA CLIENT COULD NOT CONNECT", error)
    }
}

connectPrismaClient();