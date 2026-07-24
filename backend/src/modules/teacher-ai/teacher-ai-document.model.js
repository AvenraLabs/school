import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const TeacherAiDocument = db.define(
  "teacher_ai_document",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    school_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "schools",
        key: "id",
      },
    },
    teacher_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    type: {
      type: DataTypes.STRING, // 'question_paper' | 'lesson_plan' | 'lesson_summary'
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    board: {
      type: DataTypes.STRING,
      defaultValue: "CBSE",
    },
    grade: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    chapters: {
      type: DataTypes.JSONB, // Stores array of selected chapters e.g. ["1", "2"]
      defaultValue: [],
    },
    content: {
      type: DataTypes.JSONB, // Stores structured JSON document output + user edits
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING, // 'draft' | 'saved'
      defaultValue: "draft",
    },
  },
  {
    tableName: "teacher_ai_documents",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["school_id"] },
      { fields: ["teacher_id"] },
      { fields: ["type"] },
    ],
  }
);

export default TeacherAiDocument;
