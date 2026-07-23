import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const StudentTermLedger = db.define(
  "student_term_ledger",
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
    academic_year_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "academic_years", key: "id" },
    },
    student_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "students", key: "id" },
    },
    schedule_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "class_fee_schedules", key: "id" },
    },
    term_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    paid: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    tableName: "student_term_ledgers",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["student_id"] },
    ],
  }
);

export default StudentTermLedger;
