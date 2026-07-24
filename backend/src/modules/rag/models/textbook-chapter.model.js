import { DataTypes } from "sequelize";
import db from "../../../config/db.js";

/**
 * TextbookChapter — stores lightweight metadata about ingested textbook chapters.
 * Scoped by board+grade, NOT school_id — textbook content is standardized per board
 * and shared across all schools on the same board.
 * 
 * This table powers the Teacher AI Tools dropdowns (subjects, chapters).
 * The actual chunk text lives in ChromaDB; this is UI metadata only.
 */
const TextbookChapter = db.define(
  "textbook_chapter",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    board: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "e.g. CBSE, STATE BOARD",
    },

    grade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Numeric grade, e.g. 6, 10, 12",
    },

    subject: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "e.g. Science, Mathematics, Social Science",
    },

    chapter_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    chapter_title: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },

    book_name: {
      type: DataTypes.STRING(300),
      allowNull: true,
      comment: "Original PDF filename, for reference",
    },
  },
  {
    tableName: "textbook_chapters",
    underscored: true,
    timestamps: true,
    indexes: [
      // Fast lookup for dropdown queries
      { fields: ["board", "grade", "subject"] },
      { fields: ["board", "grade"] },
      // Prevent duplicate chapter entries from re-ingestion
      {
        unique: true,
        fields: ["board", "grade", "subject", "chapter_number"],
        name: "uq_textbook_chapter",
      },
    ],
  }
);

export default TextbookChapter;
