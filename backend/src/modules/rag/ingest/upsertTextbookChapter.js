/**
 * Legacy no-op helper for backwards compatibility.
 * RAG system now writes 100% directly to ChromaDB vector store.
 */
export async function upsertTextbookChapter() {
  return null;
}

export default upsertTextbookChapter;
