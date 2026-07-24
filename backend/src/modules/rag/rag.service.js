import { searchStudentChunks } from "./runtime/searchStudentChunks.js";

export {
  processStudentChatMessage,
  getStudentChatSessions,
  getStudentChatMessages,
  deleteStudentChatSession,
} from "./runtime/studentChat.service.js";

export { ingestAllBooks } from "./ingest/ingestAllBooks.js";

export async function retrieveRagContext({ query, classLevel, board, subject }) {
  const { chunks, metadatas } = await searchStudentChunks({
    question: query,
    board,
    grade: classLevel,
    subject,
    limit: 5,
  });
  return { chunks, metadatas };
}
