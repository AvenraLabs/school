import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const BookIssue = db.define(
  "book_issue",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    school_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "schools", key: "id" },
    },
    book_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "books", key: "id" },
    },
    borrower_type: {
      type: DataTypes.ENUM("student", "teacher"),
      allowNull: false,
      defaultValue: "student",
    },
    student_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "students", key: "id" },
    },
    teacher_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "teachers", key: "id" },
    },
    issue_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    returned_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("issued", "returned", "lost", "damaged", "cancelled"),
      allowNull: false,
      defaultValue: "issued",
    },
    issued_by: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    returned_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
    fine_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "book_issues",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["school_id"] },
      { fields: ["student_id"] },
      { fields: ["teacher_id"] },
      { fields: ["book_id"] },
      { fields: ["status"] },
    ],
  }
);

export default BookIssue;
