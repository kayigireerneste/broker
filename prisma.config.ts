import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// Explicitly load .env here because when a custom prisma.config.ts exists,
// the Prisma CLI skips its own env loading step. Loading dotenv ensures
// process.env.DATABASE_URL is available to the config below.
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  // Use process.env here instead of prisma/config's env() helper so the
  // CLI can load the project's `.env` before this module is evaluated.
  datasource: {
    url: process.env.DATABASE_URL || "",
  },
});
