import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { scanBooks } from "./scanBooks.js";
import { ingestBook } from "./ingestBook.js";

// Load environment variables if run directly via CLI
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_BOOKS_DIR = path.resolve(__dirname, "../../../../books");

export async function ingestAllBooks(booksDir = DEFAULT_BOOKS_DIR) {
  console.log(`[RAG Ingest] Starting textbook ingestion from: ${booksDir}`);
  const startTime = Date.now();

  const bookTasks = scanBooks(booksDir);
  console.log(`[RAG Ingest] Discovered ${bookTasks.length} textbook PDF file(s).`);

  let totalIngested = 0;
  let errorCount = 0;

  for (let i = 0; i < bookTasks.length; i++) {
    const task = bookTasks[i];
    console.log(`\n--- [${i + 1}/${bookTasks.length}] Ingesting ${task.board}/${task.grade}/${task.subject}/${task.filename} ---`);
    try {
      const count = await ingestBook(task);
      totalIngested += count;
    } catch (e) {
      errorCount++;
      console.error(`[RAG Ingest] Failed to ingest ${task.filename}:`, e.message);
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n==================================================`);
  console.log(`[RAG Ingest] Ingestion complete!`);
  console.log(`- Total Files Processed: ${bookTasks.length}`);
  console.log(`- Total Chunks Stored: ${totalIngested}`);
  console.log(`- Errors: ${errorCount}`);
  console.log(`- Time Elapsed: ${durationSec}s`);
  console.log(`==================================================\n`);

  return { bookCount: bookTasks.length, chunkCount: totalIngested, errorCount };
}

// Auto-run if executed directly via node CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  ingestAllBooks().catch((err) => {
    console.error("Fatal ingestion error:", err);
    process.exit(1);
  });
}
