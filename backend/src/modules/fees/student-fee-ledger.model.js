import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const StudentFeeLedger = db.define(
  "student_fee_ledger",
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
    scholarship_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    fee_mode: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "full",
    },
    custom_total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    tableName: "student_fee_ledgers",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["student_id"] },
      { fields: ["school_id", "academic_year_id"] },
    ],
  }
);

export default StudentFeeLedger;
