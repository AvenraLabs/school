import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const TeacherQuiz = db.define(
  "teacher_quiz",
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
    class_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "classes",
        key: "id",
      },
    },
    section_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: "sections",
        key: "id",
      },
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    chapter: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    difficulty: {
      type: DataTypes.STRING,
      defaultValue: "MEDIUM",
    },
    total_marks: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    estimated_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 15,
    },
    show_correct_answers: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    show_explanations: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "published",
    },
  },
  {
    tableName: "teacher_quizzes",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["school_id"] },
      { fields: ["class_id"] },
      { fields: ["teacher_id"] },
    ],
  }
);

export default TeacherQuiz;
