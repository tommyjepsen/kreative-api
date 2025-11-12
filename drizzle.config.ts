import "dotenv/config";
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    // url: "postgresql://tommyjepsen:@127.0.0.1:5432/jemogfix"!, //MACbook local
    url: "postgresql://myuser:mypassword@static.210.28.202.116.clients.your-server.de:5432/kreativ"!, //Push remotely to hetzner
    // url: "postgresql://myuser:mypassword@localhost:5432/kreative"!, //hetzner local
  },
});
