const express = require("express");
const createCategoryController = require("../controllers/createCategoryController");
const getCategoryByIdController = require("../controllers/getCategoryByIdController");
const searchCategoriesController = require("../controllers/searchCategoriesController");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

router.get("/search", searchCategoriesController);
router.get("/:id", getCategoryByIdController);
router.post("/", authenticateToken, createCategoryController);

module.exports = router;
