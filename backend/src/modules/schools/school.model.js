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

    board: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "CBSE",
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

    promotion_wizard_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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

    /* ── Library Settings ── */
    library_loan_period_days: {
      type: DataTypes.INTEGER,
      defaultValue: 14,
    },

    library_fine_to_fees: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    library_overdue_whatsapp_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    library_overdue_reminder_days: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },

    library_overdue_fine_per_day: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },

    /* ── Fee Settings ── */
    fee_receipt_counter: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
