import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const Trip = db.define(
  "trip",
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

    driver_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "drivers", key: "id" },
    },

    vehicle_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "vehicles", key: "id" },
    },

    trip_type: {
      type: DataTypes.ENUM("pickup", "drop"),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("active", "completed"),
      allowNull: false,
      defaultValue: "active",
    },

    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    ended_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "trips",
    underscored: true,
    indexes: [
      { fields: ["school_id"] },
      { fields: ["driver_id"] },
      { fields: ["vehicle_id"] },
      { fields: ["status"] },
    ],
  }
);

export default Trip;
