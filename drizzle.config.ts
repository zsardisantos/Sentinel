// This file provides three facts to the ORM, Drizzle: 
// 1. What kind of database are we using?
// 2. Where is the schema (the TS file describing the tables)?
// 3. How do I connect, and where should migration files go?

import {defineConfig} from "drizzle-kit";

process.loadEnvFile(); //Node's built-in .env reader, puts DATABASE_URL into process.env

export default defineConfig({
    dialect: "postgresql",
    schema: "./db/schema.ts",
    out: "./drizzle", // generated SQL migration files go here
    dbCredentials: { url: process.env.DATABASE_URL! },
  });