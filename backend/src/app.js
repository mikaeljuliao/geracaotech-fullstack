const express = require("express");

const app = express();
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");

app.use(express.json());
app.use("/v1/user", userRoutes);
app.use("/v1/category", categoryRoutes);

module.exports = app;
