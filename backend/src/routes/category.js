const express = require("express");
const categoryController = require("../controllers/categoryController");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

router.get("/search", categoryController.search);
router.get("/:id", categoryController.getById);
router.post("/", authenticateToken, categoryController.create);
router.put("/:id", authenticateToken, categoryController.update);
router.delete("/:id", authenticateToken, categoryController.delete);

module.exports = router;
