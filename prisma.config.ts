import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Cargar .env y .env.local (Next.js convention)
config({ path: ".env" });
config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
