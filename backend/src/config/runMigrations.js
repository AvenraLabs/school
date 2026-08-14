import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import db from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, "../../migrations");

/**
 * Automatically executes all pending database migration scripts inside backend/migrations/
 * Tracks executed migrations in the "SequelizeMeta" table.
 */
export async function runPendingMigrations() {
  try {
    // 1. Ensure SequelizeMeta table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        name VARCHAR(255) NOT NULL PRIMARY KEY,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Read executed migrations
    const [executedRows] = await db.query(`SELECT name FROM "SequelizeMeta" ORDER BY name ASC;`);
    const executedSet = new Set(executedRows.map((r) => r.name));

    // 3. Read migration files from backend/migrations/
    if (!fs.existsSync(migrationsDir)) {
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => (f.endsWith(".cjs") || f.endsWith(".js")) && !f.startsWith("."))
      .sort();

    const pending = files.filter((f) => !executedSet.has(f));

    if (pending.length === 0) {
      return;
    }

    console.log(`[Migrations] Found ${pending.length} pending migration(s)...`);

    const queryInterface = db.getQueryInterface();
    const Sequelize = db.Sequelize;

    for (const file of pending) {
      const filePath = path.join(migrationsDir, file);
      console.log(`[Migrations] Applying: ${file}`);

      let migrationModule;
      if (file.endsWith(".cjs")) {
        const { createRequire } = await import("module");
        const require = createRequire(import.meta.url);
        migrationModule = require(filePath);
      } else {
        const fileUrl = pathToFileURL(filePath).href;
        migrationModule = await import(fileUrl);
      }

      const migration = migrationModule.default || migrationModule;
      if (typeof migration.up === "function") {
        await migration.up(queryInterface, Sequelize);
      }

      await db.query(`INSERT INTO "SequelizeMeta" (name) VALUES (:name);`, {
        replacements: { name: file },
      });

      console.log(`[Migrations] Successfully applied: ${file}`);
    }

    console.log("[Migrations] All pending migrations applied.");
  } catch (err) {
    console.error("[Migrations] Migration execution failed:", err);
    throw err;
  }
}

export default runPendingMigrations;
