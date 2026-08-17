/**
 * Canonical board-name mapping and normalization utility.
 * Ensures consistent matching between School.board, API queries, and RAG ingestion folders.
 */

export const BOARD_ALIASES = {
  // CBSE
  "CBSE": "CBSE",
  "CENTRAL BOARD": "CBSE",
  "CENTRAL BOARD OF SECONDARY EDUCATION": "CBSE",
  "NCERT": "CBSE",

  // State Board (TN, Samacheer, etc.)
  "STATEBOARD": "STATEBOARD",
  "STATE BOARD": "STATEBOARD",
  "STATE_BOARD": "STATEBOARD",
  "TN STATE BOARD": "STATEBOARD",
  "TN STATEBOARD": "STATEBOARD",
  "TAMIL NADU STATE BOARD": "STATEBOARD",
  "TAMILNADU STATE BOARD": "STATEBOARD",
  "TAMIL NADU": "STATEBOARD",
  "TNSB": "STATEBOARD",
  "SAMACHEER": "STATEBOARD",
  "SAMACHEER KALVI": "STATEBOARD",
  "MATRIC": "STATEBOARD",
  "MATRICULATION": "STATEBOARD",

  // ICSE / CISCE
  "ICSE": "ICSE",
  "CISCE": "ICSE",
  "ISC": "ICSE",

  // International
  "IB": "IB",
  "INTERNATIONAL BACCALAUREATE": "IB",
  "IGCSE": "IGCSE",
  "CAMBRIDGE": "IGCSE",
};

/**
 * Normalizes any board string to its canonical value (e.g. "CBSE", "STATEBOARD").
 * If no alias matches, it cleans punctuation and returns the uppercase representation.
 *
 * @param {string} board - Raw board name from user/school/database/folder
 * @returns {string} Normalized canonical board name
 */
export function normalizeBoard(board) {
  if (!board || typeof board !== "string") return "CBSE";
  const trimmed = board.trim();
  if (!trimmed) return "CBSE";

  const upper = trimmed.toUpperCase();
  if (BOARD_ALIASES[upper]) {
    return BOARD_ALIASES[upper];
  }

  // Clean punctuation and spacing for alias matching
  const clean = upper.replace(/[^A-Z0-9]/g, "");
  for (const [alias, canonical] of Object.entries(BOARD_ALIASES)) {
    const cleanAlias = alias.replace(/[^A-Z0-9]/g, "");
    if (clean === cleanAlias) {
      return canonical;
    }
  }

  // Check if string contains "STATE" or "SAMACHEER" or "TAMIL"
  if (clean.includes("STATE") || clean.includes("SAMACHEER") || clean.includes("TAMILNADU") || clean.includes("TNSB")) {
    return "STATEBOARD";
  }
  if (clean.includes("CBSE") || clean.includes("NCERT")) {
    return "CBSE";
  }
  if (clean.includes("ICSE") || clean.includes("CISCE")) {
    return "ICSE";
  }

  return clean || "CBSE";
}
