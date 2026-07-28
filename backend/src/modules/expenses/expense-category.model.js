import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const ExpenseCategory = db.define(
  "expense_category",
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "expense_categories",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["school_id"] },
    ],
  }
);

export default ExpenseCategory;
