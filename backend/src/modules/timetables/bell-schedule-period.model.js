import { DataTypes } from "sequelize";
import db from "../../config/db.js";
import BellScheduleTemplate from "./bell-schedule-template.model.js";

const BellSchedulePeriod = db.define(
  "bell_schedule_period",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    template_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "bell_schedule_templates",
        key: "id",
      },
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    start_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_break: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "bell_schedule_periods",
    underscored: true,
    timestamps: true,
    indexes: [
      { name: "idx_bsp_template_id", fields: ["template_id"] },
    ],
  }
);

BellSchedulePeriod.belongsTo(BellScheduleTemplate, { foreignKey: "template_id" });
BellScheduleTemplate.hasMany(BellSchedulePeriod, { foreignKey: "template_id", as: "periods" });

export default BellSchedulePeriod;
