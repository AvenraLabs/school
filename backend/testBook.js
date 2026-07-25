import dotenv from "dotenv";
import path from "path";
import { ingestBook } from "./src/modules/rag/ingest/ingestBook.js";

dotenv.config();

console.log("=== Starting Test Textbook Ingestion ===");

// 1. Ingest CBSE Book (Grade 6 Mathematics Chap-1.pdf)
console.log("\n--- Ingesting CBSE Book ---");
await ingestBook({
  board: "cbse",
  grade: "6",
  subject: "Mathematics",
  filename: "Chap-1.pdf",
  relPath: "cbse/6/Mathematics/Chap-1.pdf",
  pdfPath: path.resolve("books/cbse/6/Mathematics/Chap-1.pdf"),
});

// 2. Ingest Stateboard Book (Grade 6 Mathematics Term 1.pdf)
console.log("\n--- Ingesting Stateboard Book ---");
await ingestBook({
  board: "stateboard",
  grade: "6",
  subject: "Mathematics",
  filename: "Term 1.pdf",
  relPath: "stateboard/6/Mathematics/Term 1.pdf",
  pdfPath: path.resolve("books/stateboard/6/Mathematics/Term 1.pdf"),
});

console.log("\nDone! Ingestion test script finished successfully.");
process.exit(0);
