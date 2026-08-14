import { parsePdf } from "./parsePdf.js";
import { cleanText } from "./cleanText.js";
import { detectChapters } from "./detectChapters.js";
import { chunkText } from "./chunkText.js";
import { embedChunks } from "./embedChunks.js";
import { storeChunks, filterExistingChunks } from "./storeChunks.js";

/**
 * End-to-end ingestion pipeline for a single textbook PDF.
 * Writes chunk text + embeddings + metadata directly to ChromaDB (textbook_chunks)
 */
export async function ingestBook({ board, grade, subject, pdfPath, filename, relPath }) {
  const bookIdentifier = relPath || filename;
  console.log(`[RAG Ingest] Processing: ${board} / Grade ${grade} / ${subject} (${bookIdentifier})...`);

  // Step 1: Parse PDF text page by page using PyMuPDF
  const rawPages = await parsePdf(pdfPath);
  if (!rawPages || rawPages.length === 0) {
    console.warn(`[RAG Ingest] Warning: No pages extracted from ${pdfPath}`);
    return 0;
  }

  // Step 2: Clean text (headers, footers, page numbers, formatting)
  const cleanedPages = cleanText(rawPages);

  // Step 3: Detect single vs multi-chapter structure (virtual in-memory chapters)
  const virtualChapters = await detectChapters({
    filename,
    pages: cleanedPages,
    subject,
  });

  let totalChunksStored = 0;

  // Step 4: Process each virtual chapter
  for (const vChap of virtualChapters) {
    // Step 5: Chunk text (chunk_size=700, chunk_overlap=100)
    const chunks = chunkText({ virtualChapter: vChap });
    if (chunks.length === 0) continue;

    // Step 5b: Check existing chunk IDs in ChromaDB to save Gemini embedding API calls
    const { chunksToEmbed, existingCount } = await filterExistingChunks({
      board,
      grade,
      subject,
      bookName: bookIdentifier,
      chapterNumber: vChap.chapterNumber,
      chunks,
    });

    if (chunksToEmbed.length === 0) {
      console.log(
        `[RAG Ingest] All ${existingCount} chunks for Chapter ${vChap.chapterNumber} (${vChap.chapterTitle}) already exist in ChromaDB. Skipping embedding.`
      );
      totalChunksStored += existingCount;
      continue;
    }

    // Step 6: Embed ONLY new/missing chunks using gemini-embedding-001
    const textsToEmbed = chunksToEmbed.map((c) => c.text);
    const embeddings = await embedChunks(textsToEmbed);

    // Step 7: Store new chunks in ChromaDB (deterministic IDs)
    const storedCount = await storeChunks({
      board,
      grade,
      subject,
      chapterNumber: vChap.chapterNumber,
      chapterTitle: vChap.chapterTitle,
      bookName: bookIdentifier,
      chunks: chunksToEmbed,
      embeddings,
    });

    totalChunksStored += storedCount + existingCount;
  }

  console.log(`[RAG Ingest] Successfully ingested ${totalChunksStored} chunks for ${filename}`);
  return totalChunksStored;
}

