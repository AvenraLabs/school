import { DataTypes } from "sequelize";
import db from "../../config/db.js";
import User from "../users/user.model.js";

const PushSubscription = db.define(
  "push_subscription",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    school_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    endpoint: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    p256dh: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    auth: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "push_subscriptions",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["school_id"] },
      { unique: true, fields: ["user_id", "endpoint"] },
    ],
  }
);

PushSubscription.belongsTo(User, { foreignKey: "user_id", as: "user" });

export default PushSubscription;

