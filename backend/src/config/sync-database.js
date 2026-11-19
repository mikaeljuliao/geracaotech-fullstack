const sequelize = require("./database");
require("../models/User");

async function syncDatabase() {
  try {
    await sequelize.sync();
    console.log("Database tables synchronized.");
  } catch (error) {
    console.error("Could not synchronize database tables:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

syncDatabase();
