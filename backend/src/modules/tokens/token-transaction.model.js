import { DataTypes } from "sequelize";
import db from "../../config/db.js";
// imports removed

const TokenTransaction = db.define(
  "token_transaction",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "users", key: "id" },
    },

    // why did tokens change
    type: {
      type: DataTypes.ENUM(
        "subscription_grant",
        "usage",
        "refund",
        "bonus",
        "admin_adjustment",
        "expiry"
      ),
      allowNull: false,
    },

    // positive or negative delta
    change: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    balance_before: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    balance_after: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    resource_type: {
      type: DataTypes.ENUM("tokens", "video_seconds", "image_generations"),
      allowNull: false,
      defaultValue: "tokens",
    },

    ref_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "token_transactions",
    underscored: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["type"] },
      { fields: ["created_at"] },
    ],
  }
);

// Associations
export default TokenTransaction;
