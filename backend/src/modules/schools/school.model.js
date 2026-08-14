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

    code: {
      type: DataTypes.STRING(30),
      allowNull: true,
      unique: true,
    },

    board: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "CBSE",
    },

    contact_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    logo_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "active", "suspended", "expired"),
      defaultValue: "pending",
    },

    whatsapp_annual_limit: {
      type: DataTypes.INTEGER,
      defaultValue: 10000,
    },

    whatsapp_sent_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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

    /* ── Module Feature Toggles ── */
    enabled_modules: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        transport: true,
        library: true,
        finance: true,
        ai_tutor: true,
        ai_tools: true,
        ai_video: true,
        whatsapp: true,
      },
    },
  },
  {
    tableName: "schools",
    underscored: true,
    indexes: [
      { fields: ["status"] },
    ],
  }
);

export default School;
