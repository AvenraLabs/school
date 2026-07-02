import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const Driver = db.define(
  "driver",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
      references: { model: "users", key: "id" },
    },

    school_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "schools", key: "id" },
    },

    license_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "drivers",
    underscored: true,
    indexes: [
      { fields: ["school_id"] },
      { fields: ["user_id"] },
    ],
  }
);

export default Driver;
