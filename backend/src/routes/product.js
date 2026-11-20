const express = require("express");
const searchProductsController = require("../controllers/searchProductsController");

const router = express.Router();

router.get("/search", searchProductsController);

module.exports = router;
