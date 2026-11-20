const express = require("express");
const createProductController = require("../controllers/createProductController");
const deleteProductController = require("../controllers/deleteProductController");
const getProductByIdController = require("../controllers/getProductByIdController");
const searchProductsController = require("../controllers/searchProductsController");
const updateProductController = require("../controllers/updateProductController");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

router.get("/search", searchProductsController);
router.get("/:id", getProductByIdController);
router.post("/", authenticateToken, createProductController);
router.put("/:id", authenticateToken, updateProductController);
router.delete("/:id", authenticateToken, deleteProductController);

module.exports = router;
