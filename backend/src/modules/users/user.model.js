import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const User = db.define(
  "user",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    // null only for super_admin
    school_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "schools", key: "id" },
    },

    role: {
      type: DataTypes.ENUM(
        "super_admin",
        "school_admin",
        "teacher",
        "student",
        "driver"
      ),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    first_login: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    must_change_password: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    avatar_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    underscored: true,
    indexes: [
      { fields: ["school_id"] },
      { fields: ["role"] },
      { fields: ["phone"] },
      {
        unique: true,
        fields: ["school_id", "username"],
      },
    ],
  }
);

import { deleteCache } from "../../config/redis.js";

User.addHook("beforeBulkUpdate", (options) => {
  options.individualHooks = true;
});

User.addHook("beforeBulkDestroy", (options) => {
  options.individualHooks = true;
});

User.addHook("afterUpdate", async (instance) => {
  try {
    if (instance?.id) {
      await deleteCache(`auth:identity:${instance.id}`);
    }
  } catch (err) {
    // Non-blocking
  }
});

User.addHook("afterSave", async (instance) => {
  try {
    if (instance?.id) {
      await deleteCache(`auth:identity:${instance.id}`);
    }
  } catch (err) {
    // Non-blocking
  }
});

User.addHook("afterDestroy", async (instance) => {
  try {
    if (instance?.id) {
      await deleteCache(`auth:identity:${instance.id}`);
    }
  } catch (err) {
    // Non-blocking
  }
});

export default User;
