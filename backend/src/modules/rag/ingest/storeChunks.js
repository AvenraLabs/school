import { ChromaClient } from "chromadb";

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

  const cleanBoard = String(board).toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  const cleanGrade = String(grade).toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  const cleanSubject = String(subject).toLowerCase().trim().replace(/[^a-z0-9]/g, "");

  const ids = [];
  const documents = [];
  const validEmbeddings = [];
  const metadatas = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const emb = embeddings[i];

    if (!emb || emb.length === 0) continue;

    // Deterministic ID: cbse_6_science_4_3
    const id = `${cleanBoard}_${cleanGrade}_${cleanSubject}_${chapterNumber}_${chunk.chunkOrder}`;

    ids.push(id);
    documents.push(chunk.text);
    validEmbeddings.push(emb);
    metadatas.push({
      board: String(board).toUpperCase(),
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
