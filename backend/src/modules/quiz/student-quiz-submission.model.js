import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const StudentQuizSubmission = db.define(
  "student_quiz_submission",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    quiz_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "teacher_quizzes",
        key: "id",
      },
    },
    student_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    answers: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    total_marks: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "submitted",
    },
    submitted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "student_quiz_submissions",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["student_id"] },
      { unique: true, fields: ["quiz_id", "student_id"] },
    ],
  }
);

export default StudentQuizSubmission;
