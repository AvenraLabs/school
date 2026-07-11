import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const GradingScale = db.define(
  "grading_scale",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    school_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "schools", key: "id" },
    },
    grade_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    min_percentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_pass: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    color_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#10b981",
    },
  },
  {
    tableName: "grading_scales",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["school_id"] },
      { unique: true, fields: ["school_id", "grade_name"] },
    ],
  }
);

export default GradingScale;
