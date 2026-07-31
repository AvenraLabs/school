import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const BellScheduleTemplate = db.define(
  "bell_schedule_template",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    school_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "schools",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    working_days_per_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 6,
    },
  },
  {
    tableName: "bell_schedule_templates",
    underscored: true,
    timestamps: true,
    indexes: [
      { name: "idx_bst_school_id", fields: ["school_id"] },
    ],
  }
);

export default BellScheduleTemplate;
