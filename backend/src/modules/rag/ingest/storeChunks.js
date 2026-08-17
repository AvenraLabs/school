import { ChromaClient } from "chromadb";
import { normalizeBoard } from "../shared/boardUtils.js";

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const COLLECTION_NAME = "textbook_chunks";

const chromaUrl = new URL(
  CHROMA_URL.startsWith("http") ? CHROMA_URL : `http://${CHROMA_URL}`
);
const chroma = new ChromaClient({
  host: chromaUrl.hostname,
  port: chromaUrl.port
    ? Number(chromaUrl.port)
    : chromaUrl.protocol === "https:"
    ? 443
    : 80,
  ssl: chromaUrl.protocol === "https:",
});

export async function getOrGetCollection() {
  try {
    return await chroma.getOrCreateCollection({
      name: COLLECTION_NAME,
      metadata: { "hnsw:space": "cosine" },
    });
  } catch (e) {
    console.error("[storeChunks] Failed to get or create ChromaDB collection:", e.message);
    throw e;
  }
}

export async function resetChromaCollection() {
  try {
    await chroma.deleteCollection({ name: COLLECTION_NAME });
    console.log(`[storeChunks] Deleted ChromaDB collection '${COLLECTION_NAME}' successfully.`);
  } catch (err) {
    console.log(`[storeChunks] ChromaDB collection deletion status: ${err.message}`);
  }
}

/**
 * Constructs deterministic chunk ID: {cleanBoard}_{cleanGrade}_{cleanSubject}_{cleanBook}_{chapterNumber}_{chunkOrder}
 */
export function buildChunkId({ board, grade, subject, bookName, chapterNumber, chunkOrder }) {
  if (bookName) {
    const cleanBookPath = String(bookName)
      .replace(/\.pdf$/i, "")
      .replace(/[\\/]/g, "_")
      .replace(/[^a-z0-9_]/gi, "")
      .toLowerCase();

    return `${cleanBookPath}_${chapterNumber}_${chunkOrder}`;
  }

  const cleanBoard = normalizeBoard(board).toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  const cleanGrade = String(grade).toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  const cleanSubject = String(subject).toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  return `${cleanBoard}_${cleanGrade}_${cleanSubject}_${chapterNumber}_${chunkOrder}`;
}

/**
 * Checks ChromaDB for existing chunk IDs and returns only new/unstored chunks.
 * Saves Gemini embedding API costs when re-running ingestion.
 */
export async function filterExistingChunks({ board, grade, subject, bookName, chapterNumber, chunks }) {
  if (!chunks || chunks.length === 0) return { chunksToEmbed: [], existingCount: 0 };

  try {
    const collection = await getOrGetCollection();

    const candidateIds = chunks.map((c) =>
      buildChunkId({ board, grade, subject, bookName, chapterNumber, chunkOrder: c.chunkOrder })
    );

    const existingResult = await collection.get({ ids: candidateIds });
    const existingSet = new Set(existingResult?.ids || []);

    const chunksToEmbed = [];
    let existingCount = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkId = candidateIds[i];

      if (existingSet.has(chunkId)) {
        existingCount++;
      } else {
        chunksToEmbed.push(chunk);
      }
    }

    if (existingCount > 0) {
      console.log(
        `[storeChunks] Skipping embedding for ${existingCount}/${chunks.length} already existing chunks (${board}/${grade}/${subject} Chapter ${chapterNumber}).`
      );
    }

    return { chunksToEmbed, existingCount };
  } catch (e) {
    console.warn(`[storeChunks] Error querying existing IDs in ChromaDB, proceeding to embed all: ${e.message}`);
    return { chunksToEmbed: chunks, existingCount: 0 };
  }
}

/**
 * Stores chunks in ChromaDB with deterministic IDs.
 * ID schema: {board}_{grade}_{subject}_{chapter}_{chunkOrder}
 */
export async function storeChunks({
  board,
  grade,
  subject,
  chapterNumber,
  chapterTitle,
  bookName,
  chunks,
  embeddings,
}) {
  if (!chunks || chunks.length === 0) return 0;

  const collection = await getOrGetCollection();

  const ids = [];
  const documents = [];
  const validEmbeddings = [];
  const metadatas = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const emb = embeddings[i];

    if (!emb || emb.length === 0) continue;

    const id = buildChunkId({
      board,
      grade,
      subject,
      bookName,
      chapterNumber,
      chunkOrder: chunk.chunkOrder,
    });

    ids.push(id);
    documents.push(chunk.text);
    validEmbeddings.push(emb);
    metadatas.push({
      board: normalizeBoard(board),
      grade: String(grade),
      subject: String(subject),
      chapter: Number(chapterNumber),
      chapterTitle: String(chapterTitle || `Chapter ${chapterNumber}`),
      chunkOrder: Number(chunk.chunkOrder),
      pageStart: Number(chunk.pageStart),
      pageEnd: Number(chunk.pageEnd),
      bookName: String(bookName),
    });
  }

  if (ids.length > 0) {
    // Upsert chunks into ChromaDB (updates if existing ID, creates if new)
    await collection.upsert({
      ids,
      documents,
      embeddings: validEmbeddings,
      metadatas,
    });
  }

  return ids.length;
}
