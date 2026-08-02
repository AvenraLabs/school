import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, "../../migrations");

/**
 * Executes database migration scripts from backend/migrations directory automatically.
 */
export async function runPendingMigrations() {
  if (!fs.existsSync(migrationsDir)) return;

  // Drop legacy single-column unique constraint on token_policies.role if it exists
  try {
    await db.query(`ALTER TABLE token_policies DROP CONSTRAINT IF EXISTS "token_policies_role";`);
    await db.query(`DROP INDEX IF EXISTS "token_policies_role";`);
    await db.query(`ALTER TABLE token_policies DROP CONSTRAINT IF EXISTS "token_policies_role_key";`);
    await db.query(`DROP INDEX IF EXISTS "token_policies_role_key";`);
  } catch (e) {
    // Ignore error if table or constraint does not exist yet
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".cjs"))
    .sort();

  const queryInterface = db.getQueryInterface();

  for (const file of files) {
    try {
      const filePath = path.join(migrationsDir, file);
      const migrationModule = await import(`file://${filePath}`);
      const migration = migrationModule.default || migrationModule;
      if (migration && typeof migration.up === "function") {
        await migration.up(queryInterface, db.Sequelize);
      }
    } catch (err) {
      // Ignore idempotent migration errors (e.g., column/index already exists)
      if (!err.message?.includes("already exists")) {
        console.warn(`[Migrations] Migration ${file} note:`, err.message);
      }
    }
  }
}
