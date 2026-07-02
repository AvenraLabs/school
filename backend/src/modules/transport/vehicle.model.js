import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const Vehicle = db.define(
  "vehicle",
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

    vehicle_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    vehicle_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    driver_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "drivers", key: "id" },
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "vehicles",
    underscored: true,
    indexes: [
      { fields: ["school_id"] },
      { fields: ["driver_id"] },
      {
        unique: true,
        fields: ["school_id", "vehicle_number"],
      },
    ],
  }
);

export default Vehicle;
