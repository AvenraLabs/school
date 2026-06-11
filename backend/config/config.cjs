const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const base = {
  dialect: "postgres",
  logging: false,
  timezone: "+05:30",
  dialectOptions: process.env.DB_SSL === "true" || process.env.NODE_ENV === "production"
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
};

module.exports = {
  development: {
    url: process.env.DB_URI,
    ...base,
  },
  test: {
    url: process.env.DB_URI,
    ...base,
  },
  production: {
    url: process.env.DB_URI,
    ...base,
  },
};
