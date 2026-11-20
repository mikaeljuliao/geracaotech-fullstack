const express = require("express");
const path = require("path");

const app = express();
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");

app.use(express.json());
app.use("/media", express.static(path.join(__dirname, "../media")));
app.use("/v1/user", userRoutes);
app.use("/v1/category", categoryRoutes);
app.use("/v1/product", productRoutes);

module.exports = app;
