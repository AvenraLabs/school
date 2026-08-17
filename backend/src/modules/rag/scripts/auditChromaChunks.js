import path from "path";
import { fileURLToPath } from "url";
import { scanBooks } from "../ingest/scanBooks.js";
import { getOrGetCollection } from "../ingest/storeChunks.js";
import { normalizeBoard } from "../shared/boardUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ChromaDB Textbook Chunks Audit Script
 * Audits all textbook folders under backend/books against stored ChromaDB vector chunks.
 */
export async function auditChromaChunks({ strict = false } = {}) {
  const booksDir = path.resolve(__dirname, "../../../../books");
  console.log(`\n======================================================`);
  console.log(`📚 CHROMADB TEXTBOOK CHUNKS AUDIT`);
  console.log(`📂 Books Directory: ${booksDir}`);
  console.log(`======================================================\n`);

  const scannedBooks = scanBooks(booksDir);
  if (scannedBooks.length === 0) {
    console.warn("⚠️  No PDF books found in books directory.");
    return { success: false, totalExpected: 0, totalMatched: 0, totalMissing: 0 };
  }

  // Group books by canonical (board, grade, subject)
  const expectedMap = new Map();

  for (const book of scannedBooks) {
    const canonicalBoard = normalizeBoard(book.board);
    const cleanGrade = String(book.grade).replace(/\D/g, "") || String(book.grade);
    const cleanSubject = String(book.subject).trim();
    const key = `${canonicalBoard}|${cleanGrade}|${cleanSubject}`;

    if (!expectedMap.has(key)) {
      expectedMap.set(key, {
        board: canonicalBoard,
        grade: cleanGrade,
        subject: cleanSubject,
        bookFiles: [],
      });
    }
    expectedMap.get(key).bookFiles.push(book.filename);
  }

  console.log(`Found ${scannedBooks.length} PDF books across ${expectedMap.size} unique (Board, Grade, Subject) combinations.\n`);

  let collection;
  try {
    collection = await getOrGetCollection();
  } catch (err) {
    console.error(`❌ Failed to connect to ChromaDB: ${err.message}`);
    console.error(`Please ensure ChromaDB server is running (e.g. at http://localhost:8000).`);
    return { success: false, error: err.message };
  }

  // Retrieve all chunk metadata from ChromaDB for fast in-memory aggregation
  let totalChunksInCollection = 0;
  const chunkCountMap = new Map();

  try {
    const allData = await collection.get({
      include: ["metadatas"],
    });

    const metadatas = allData?.metadatas || [];
    totalChunksInCollection = metadatas.length;

    for (const meta of metadatas) {
      if (!meta) continue;
      const b = normalizeBoard(meta.board || "CBSE");
      const g = String(meta.grade || "").replace(/\D/g, "");
      const s = String(meta.subject || "").trim();

      const metaKey = `${b}|${g}|${s}`;
      chunkCountMap.set(metaKey, (chunkCountMap.get(metaKey) || 0) + 1);

      // Also key without casing for fuzzy lookup
      const lowerKey = `${b}|${g}|${s.toLowerCase()}`;
      if (lowerKey !== metaKey) {
        chunkCountMap.set(lowerKey, (chunkCountMap.get(lowerKey) || 0) + 1);
      }
    }
  } catch (err) {
    console.warn(`⚠️  Could not bulk-fetch ChromaDB collection metadatas: ${err.message}`);
  }

  console.log(`Total chunks currently in ChromaDB collection 'textbook_chunks': ${totalChunksInCollection}\n`);
  console.log(`┌────────────┬───────┬──────────────────────────────┬─────────────┬──────────────┬───────────────┐`);
  console.log(`│ Board      │ Grade │ Subject                      │ PDF Count   │ Chunks in DB │ Status        │`);
  console.log(`├────────────┼───────┼──────────────────────────────┼─────────────┼──────────────┼───────────────┤`);

  let matchedCount = 0;
  let missingCount = 0;
  const missingItems = [];

  for (const [key, item] of expectedMap.entries()) {
    let chunks = chunkCountMap.get(key) || 0;
    if (chunks === 0) {
      // Try lowercase subject lookup
      chunks = chunkCountMap.get(`${item.board}|${item.grade}|${item.subject.toLowerCase()}`) || 0;
    }

    const boardPad = item.board.padEnd(10);
    const gradePad = `Grade ${item.grade}`.padEnd(5);
    const subjectPad = item.subject.slice(0, 28).padEnd(28);
    const pdfPad = String(item.bookFiles.length).padStart(9).padEnd(11);
    const chunksPad = String(chunks).padStart(10).padEnd(12);

    if (chunks > 0) {
      matchedCount++;
      const statusPad = `✅ OK`.padEnd(13);
      console.log(`│ ${boardPad} │ ${gradePad} │ ${subjectPad} │ ${pdfPad} │ ${chunksPad} │ ${statusPad} │`);
    } else {
      missingCount++;
      missingItems.push(item);
      const statusPad = `❌ 0 CHUNKS`.padEnd(13);
      console.log(`│ ${boardPad} │ ${gradePad} │ ${subjectPad} │ ${pdfPad} │ ${chunksPad} │ ${statusPad} │`);
    }
  }

  console.log(`└────────────┴───────┴──────────────────────────────┴─────────────┴──────────────┴───────────────┘\n`);

  console.log(`======================================================`);
  console.log(`📊 AUDIT SUMMARY REPORT`);
  console.log(`======================================================`);
  console.log(`Total Combinations Expected : ${expectedMap.size}`);
  console.log(`Total Combinations Indexed  : ${matchedCount} ✅`);
  console.log(`Total Combinations Missing  : ${missingCount} ${missingCount > 0 ? "❌" : "✅"}`);
  console.log(`Total Vector Chunks in DB   : ${totalChunksInCollection}`);
  console.log(`======================================================\n`);

  if (missingCount > 0) {
    console.warn(`⚠️  WARNING: ${missingCount} folder(s) have 0 chunks in ChromaDB:`);
    for (const m of missingItems) {
      console.warn(`   - ${m.board} Grade ${m.grade} - ${m.subject} (${m.bookFiles.join(", ")})`);
    }
    console.warn(`\n👉 Run 'npm run rag:ingest' to ingest missing textbooks.\n`);
  } else {
    console.log(`🎉 All expected textbook units are fully indexed and ready in ChromaDB!\n`);
  }

  return {
    success: missingCount === 0,
    totalExpected: expectedMap.size,
    totalMatched: matchedCount,
    totalMissing: missingCount,
    missingItems,
    totalChunksInCollection,
  };
}

// Direct CLI invocation
if (process.argv[1] && process.argv[1].endsWith("auditChromaChunks.js")) {
  const isStrict = process.argv.includes("--strict");
  auditChromaChunks({ strict: isStrict })
    .then((res) => {
      if (isStrict && !res.success) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error("Fatal audit error:", err);
      process.exit(1);
    });
}
