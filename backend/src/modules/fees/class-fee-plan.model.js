import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const ClassFeePlan = db.define(
  "class_fee_plan",
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
      allowNull: false,
      references: { model: "classes", key: "id" },
    },
    fee_category_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "fee_categories", key: "id" },
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "class_fee_plans",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["class_id"] },
    ],
  }
);

export default ClassFeePlan;
