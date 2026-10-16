// What this file does: it creates one database connection object, db, and shares
// it with the whole app. Every function will import it. 

// TODO 1: import { drizzle } from the node-postgres subpath of drizzle-orm
// syntax: import {thingname} from "package/subpath";


import {drizzle} from "drizzle-orm/node-postgres";

// TODO 2: load .env into process.env (same line as drizzle.config.ts)
//pattern: calling a function on an object with no arguments: 
// object.method(); like console.log();

process.loadEnvFile(); // object.method(), process is the object, method is loadEnvFile();

// TODO 3: read process.env.DATABASE_URL into a const named databaseUrl
const databaseUrl = process.env.DATABASE_URL;

// TODO 4: if databaseUrl is missing, throw an Error whose message says
//         which variable is missing and where to set it (.env)

if (!databaseUrl){
    throw new Error("DATABASE_URL is missing. Please load the Database URL correctly in the .env file.");
}
// TODO 5: export const db = drizzle(databaseUrl)
//I give the drizzle function the connection string (databaseUrl) which is defined in the .env file
// and then it gives back a ready-to-use database object, with the connection pool set up inside.

export const db = drizzle(databaseUrl)
