import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const ExamMark = db.define(
  "exam_mark",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    school_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "schools", key: "id" },
    },

    academic_year_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "academic_years", key: "id" },
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
      onDelete: "CASCADE",
    },

    student_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "students", key: "id" },
      onDelete: "CASCADE",
    },

    marks_obtained: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    max_marks: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 100,
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    entered_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
  },
  {
    tableName: "exam_marks",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["school_id"] },
      { fields: ["exam_id"] },
      { fields: ["student_id"] },
      { fields: ["subject_id"] },
      { unique: true, fields: ["exam_id", "subject_id", "student_id"] },
    ],
  }
);

export default ExamMark;
