import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const StudentFee = db.define(
  "student_fee",
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
    fee_definition_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "fee_definitions", key: "id" },
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    concession_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    concession_reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    paid_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    balance_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pending", // 'pending', 'partial', 'paid', 'waived'
    },
  },
  {
    tableName: "student_fees",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["student_id"] },
      { fields: ["fee_definition_id"] },
      { fields: ["status"] },
    ],
  }
);

export default StudentFee;
