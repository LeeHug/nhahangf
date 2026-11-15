import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_ADMIN_USER || process.env.SQL_USER;
const password = process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD;
const port = process.env.SQL_PORT ? Number(process.env.SQL_PORT) : 5432;

let dbCredentials: any;
if (databaseUrl) {
  dbCredentials = {
    url: databaseUrl,
    ssl: databaseUrl.includes('sslmode=require') || databaseUrl.includes('supabase') || databaseUrl.includes('neon') ? { rejectUnauthorized: false } : false,
  };
} else {
  dbCredentials = {
    host: sqlHost || 'localhost',
    port: port,
    user: user || 'postgres',
    password: password || '',
    database: sqlDbName || 'postgres',
    ssl: false,
  };
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials,
  verbose: true,
});
