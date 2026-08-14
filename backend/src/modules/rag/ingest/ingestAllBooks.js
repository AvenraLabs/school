import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { scanBooks } from "./scanBooks.js";
import { ingestBook } from "./ingestBook.js";
import { resetChromaCollection } from "./storeChunks.js";

// Load environment variables if run directly via CLI
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_BOOKS_DIR = path.resolve(__dirname, "../../../../books");
const PROGRESS_FILE_PATH = path.resolve(__dirname, "../../../../rag_data/ingestion-progress.json");

function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE_PATH)) {
      const data = fs.readFileSync(PROGRESS_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("[RAG Ingest] Could not read progress file, starting fresh:", err.message);
  }
  return { completed: {}, lastUpdated: null };
}

function saveProgress(progress) {
  try {
    const dir = path.dirname(PROGRESS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    progress.lastUpdated = new Date().toISOString();
    fs.writeFileSync(PROGRESS_FILE_PATH, JSON.stringify(progress, null, 2), "utf-8");
  } catch (err) {
    console.error("[RAG Ingest] Failed to save progress file:", err.message);
  }
}

export async function ingestAllBooks(booksDir = DEFAULT_BOOKS_DIR, options = {}) {
  console.log(`[RAG Ingest] Starting textbook ingestion from: ${booksDir}`);
  const startTime = Date.now();

  const isReset = options.reset || process.argv.includes("--reset") || process.argv.includes("--force");
  let progress = isReset ? { completed: {}, lastUpdated: null } : loadProgress();

  if (isReset) {
    console.log("\n==================================================");
    console.log("[RAG Ingest] RESET FLAG DETECTED!");
    console.log("1. Clearing ChromaDB collection 'textbook_chunks'...");
    await resetChromaCollection();

    console.log("2. Clearing ingestion-progress.json log...");
    saveProgress(progress);
    console.log("==================================================\n");
  }

  const bookTasks = scanBooks(booksDir);
  console.log(`[RAG Ingest] Discovered ${bookTasks.length} textbook PDF file(s).`);

  const completedCount = Object.keys(progress.completed || {}).length;
  if (completedCount > 0) {
    console.log(`[RAG Ingest] Resuming session: ${completedCount}/${bookTasks.length} books already completed.`);
  }

  let totalIngested = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < bookTasks.length; i++) {
    const task = bookTasks[i];
    const taskKey = task.relPath || `${task.board}/${task.grade}/${task.subject}/${task.filename}`;

    // Skip if already recorded as completed in progress file
    if (progress.completed[taskKey]) {
      skippedCount++;
      console.log(`[RAG Ingest] [${i + 1}/${bookTasks.length}] Skipping already completed: ${taskKey}`);
      continue;
    }

    console.log(`\n--- [${i + 1}/${bookTasks.length}] Ingesting ${taskKey} ---`);
    try {
      const count = await ingestBook(task);
      totalIngested += count;

      // Save progress immediately after each successful book ingestion
      progress.completed[taskKey] = {
        completedAt: new Date().toISOString(),
        chunksCount: count,
      };
      saveProgress(progress);
    } catch (e) {
      errorCount++;
      console.error(`[RAG Ingest] Failed to ingest ${taskKey}:`, e.message);
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n==================================================`);
  console.log(`[RAG Ingest] Ingestion run completed!`);
  console.log(`- Total Files Discovered: ${bookTasks.length}`);
  console.log(`- Skipped (Already Completed): ${skippedCount}`);
  console.log(`- Processed in this run: ${bookTasks.length - skippedCount}`);
  console.log(`- Total Chunks Stored: ${totalIngested}`);
  console.log(`- Errors: ${errorCount}`);
  console.log(`- Time Elapsed: ${durationSec}s`);
  console.log(`==================================================\n`);

  try {
    const { invalidateCurriculumCache } = await import("../curriculum-cache.service.js");
    invalidateCurriculumCache();
  } catch {}

  return { bookCount: bookTasks.length, skippedCount, chunkCount: totalIngested, errorCount };
}

// Auto-run if executed directly via node CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  ingestAllBooks().catch((err) => {
    console.error("Fatal ingestion error:", err);
    process.exit(1);
  });
}
