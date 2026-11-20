const express = require("express");

const app = express();
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");

app.use(express.json());
app.use("/v1/user", userRoutes);
app.use("/v1/category", categoryRoutes);
app.use("/v1/product", productRoutes);

module.exports = app;
