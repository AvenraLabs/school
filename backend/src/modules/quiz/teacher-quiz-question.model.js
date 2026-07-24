import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const TeacherQuizQuestion = db.define(
  "teacher_quiz_question",
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
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    question_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    options: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    correct_answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    marks: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    tableName: "teacher_quiz_questions",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["quiz_id"] },
    ],
  }
);

export default TeacherQuizQuestion;
