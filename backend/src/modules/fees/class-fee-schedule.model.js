import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const ClassFeeSchedule = db.define(
  "class_fee_schedule",
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
    term_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "class_fee_schedules",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["class_id"] },
    ],
  }
);

export default ClassFeeSchedule;
