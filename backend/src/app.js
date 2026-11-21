const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");

const mediaDir = path.join(__dirname, "../media");
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

app.use(express.json());
app.use(cors({ origin: true }));
app.use("/media", express.static(mediaDir));
app.use("/v1/user", userRoutes);
app.use("/v1/category", categoryRoutes);
app.use("/v1/product", productRoutes);

module.exports = app;
