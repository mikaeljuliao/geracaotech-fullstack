const express = require("express");
const productController = require("../controllers/productController");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

router.get("/search", productController.search);
router.get("/:id", productController.getById);
router.post("/", authenticateToken, productController.create);
router.put("/:id", authenticateToken, productController.update);
router.delete("/:id", authenticateToken, productController.delete);

module.exports = router;
