import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const ExamMaster = db.define(
  "exam_master",
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

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "exam_masters",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["school_id"] },
      { unique: true, fields: ["school_id", "name"] },
    ],
  }
);

export default ExamMaster;
