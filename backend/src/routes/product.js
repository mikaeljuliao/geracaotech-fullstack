const express = require("express");
const createProductController = require("../controllers/createProductController");
const getProductByIdController = require("../controllers/getProductByIdController");
const searchProductsController = require("../controllers/searchProductsController");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

router.get("/search", searchProductsController);
router.get("/:id", getProductByIdController);
router.post("/", authenticateToken, createProductController);

module.exports = router;
