const express = require("express");

const app = express();
const userRoutes = require("./routes/user");

app.use(express.json());
app.use("/v1/user", userRoutes);

module.exports = app;
