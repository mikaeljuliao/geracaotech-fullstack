const express = require("express");
const getProductByIdController = require("../controllers/getProductByIdController");
const searchProductsController = require("../controllers/searchProductsController");

const router = express.Router();

router.get("/search", searchProductsController);
router.get("/:id", getProductByIdController);

module.exports = router;
