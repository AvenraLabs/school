import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const Exam = db.define(
  "exam",
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

    academic_year_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "academic_years", key: "id" },
    },

    class_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "classes", key: "id" },
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    exam_master_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "exam_masters", key: "id" },
    },

    is_locked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "exams",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["school_id"] },
      { fields: ["class_id"] },
      { unique: true, fields: ["school_id", "class_id", "name"] },
      { unique: true, fields: ["school_id", "class_id", "exam_master_id"] },
    ],
  }
);

export default Exam;
