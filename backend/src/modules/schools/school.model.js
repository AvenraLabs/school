import { DataTypes } from "sequelize";
import db from "../../config/db.js";


const School = db.define(
  "school",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    school_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    zip: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    contact_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    logo_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "active", "suspended", "expired"),
      defaultValue: "pending",
    },

    whatsapp_bus_start_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    whatsapp_bus_end_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    google_maps_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    risk_attendance_cutoff: {
      type: DataTypes.INTEGER,
      defaultValue: 75,
    },

    risk_academic_cutoff: {
      type: DataTypes.INTEGER,
      defaultValue: 40,
    },

    risk_grade_drop_margin: {
      type: DataTypes.INTEGER,
      defaultValue: 15,
    },
  },
  {
    tableName: "schools",
    underscored: true,
    indexes: [
      { fields: ["status"] },
      { fields: ["city"] },
      { fields: ["state"] },
    ],
  }
);

export default School;
