import api from "./axios";

/**
 * Get distinct subjects that have been ingested for a given board + grade.
 * Returns [] if nothing ingested yet (Teacher AI falls back to Gemini-only mode).
 */
export const getCurriculumSubjects = async (board, grade) => {
  const gradeNum = String(grade).replace(/\D/g, "");
  const res = await api.get("/rag/curriculum/subjects", {
    params: { board: String(board).toUpperCase(), grade: gradeNum },
  });
  return res.data?.subjects || [];
};

/**
 * Get chapters for a board + grade + subject, sorted by chapter_number.
 * Each item: { number, title, label }
 */
export const getCurriculumChapters = async (board, grade, subject) => {
  const gradeNum = String(grade).replace(/\D/g, "");
  const res = await api.get("/rag/curriculum/chapters", {
    params: { board: String(board).toUpperCase(), grade: gradeNum, subject },
  });
  return res.data?.chapters || [];
};

/**
 * Get distinct grades that have been ingested for a given board.
 * Returns numeric array e.g. [6, 7, 8, 10]
 */
export const getCurriculumGrades = async (board) => {
  const res = await api.get("/rag/curriculum/grades", {
    params: { board: String(board).toUpperCase() },
  });
  return res.data?.grades || [];
};
