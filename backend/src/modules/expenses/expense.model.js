import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const Expense = db.define(
  "expense",
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
      allowNull: true,
      references: { model: "academic_years", key: "id" },
    },
    category_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "expense_categories", key: "id" },
    },
    voucher_no: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    vendor: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    payment_mode: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "cash", // 'cash', 'upi', 'bank_transfer', 'cheque'
    },
    reference_no: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    expense_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attachment_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_cancelled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    cancelled_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancel_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
    updated_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
  },
  {
    tableName: "expenses",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["school_id"] },
      { fields: ["category_id"] },
      { fields: ["expense_date"] },
      { fields: ["is_cancelled"] },
    ],
  }
);

export default Expense;
