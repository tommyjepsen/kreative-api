import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { Pool } from "pg";

const pgPool = new Pool({ connectionString: process.env.POSTGRES_URL });

const db = drizzle({ client: pgPool, schema });
export default db;
