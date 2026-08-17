import { runPendingMigrations } from "./runMigrations.js";

async function main() {
  try {
    await runPendingMigrations();
    console.log("[Migration Runner] Migration check completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("[Migration Runner] Migration execution failed:", err);
    process.exit(1);
  }
}

main();
