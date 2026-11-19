require("dotenv").config({ quiet: true });

const { Sequelize } = require("sequelize");

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;

if (!DB_NAME || !DB_USER) {
  throw new Error("Configure DB_NAME and DB_USER in the backend .env file.");
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD || "", {
  dialect: "mysql",
  host: DB_HOST || "localhost",
  port: Number(DB_PORT || 3306),
  logging: false,
});

module.exports = sequelize;
