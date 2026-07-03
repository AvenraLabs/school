import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const ExamSubject = db.define(
  "exam_subject",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    exam_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "exams", key: "id" },
      onDelete: "CASCADE",
    },

    subject_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "subjects", key: "id" },
    },

    // e.g. "Chapter 3 - Fractions", "Lesson 1-4"
    syllabus: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    exam_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    tableName: "exam_subjects",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["exam_id"] },
      { fields: ["subject_id"] },
      { unique: true, fields: ["exam_id", "subject_id"] },
    ],
  }
);

export default ExamSubject;
