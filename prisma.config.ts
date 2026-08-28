import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Configuração da CLI do Prisma 7.
// A URL do banco fica aqui (não mais dentro do schema.prisma).
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
