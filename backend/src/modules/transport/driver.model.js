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

import { deleteCache } from "../../config/redis.js";

Driver.addHook("beforeBulkUpdate", (options) => {
  options.individualHooks = true;
});

Driver.addHook("beforeBulkDestroy", (options) => {
  options.individualHooks = true;
});

Driver.addHook("afterUpdate", async (instance) => {
  try {
    if (instance?.user_id) {
      await deleteCache(`auth:identity:${instance.user_id}`);
    }
  } catch (err) {
    // Non-blocking
  }
});

Driver.addHook("afterSave", async (instance) => {
  try {
    if (instance?.user_id) {
      await deleteCache(`auth:identity:${instance.user_id}`);
    }
  } catch (err) {
    // Non-blocking
  }
});

Driver.addHook("afterDestroy", async (instance) => {
  try {
    if (instance?.user_id) {
      await deleteCache(`auth:identity:${instance.user_id}`);
    }
  } catch (err) {
    // Non-blocking
  }
});

export default Driver;
