import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const FeePayment = db.define(
  "fee_payment",
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
    student_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "students", key: "id" },
    },
    student_fee_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "student_fees", key: "id" },
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    late_fee_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    mode: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "cash",
    },
    reference: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    receipt_no: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    paid_by: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    is_void: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    voided_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
    voided_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    void_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "fee_payments",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["student_id"] },
      { fields: ["student_fee_id"] },
    ],
  }
);

export default FeePayment;
