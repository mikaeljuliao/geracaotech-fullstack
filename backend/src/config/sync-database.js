const sequelize = require("./database");
require("../models/User");
require("../models/category");
require("../models/Product");

async function syncDatabase() {
  try {
    await sequelize.sync({ force: true });
    console.log("Database tables synchronized.");
  } catch (error) {
    console.error("Could not synchronize database tables:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

syncDatabase();
