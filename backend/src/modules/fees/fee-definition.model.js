import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const FeeDefinition = db.define(
  "fee_definition",
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
    class_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "classes", key: "id" },
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    breakdown: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    fee_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "class", // 'class' or 'individual'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "fee_definitions",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["school_id", "class_id"] },
    ],
  }
);

export default FeeDefinition;
