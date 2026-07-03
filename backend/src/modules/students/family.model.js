import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const Family = db.define(
  "family",
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

    father_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    mother_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    guardian_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "families",
    underscored: true,
    indexes: [
      { fields: ["school_id"] },
      { fields: ["guardian_phone"] },
    ],
  }
);

export default Family;
