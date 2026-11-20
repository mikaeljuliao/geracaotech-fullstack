const express = require("express");
const createCategoryController = require("../controllers/createCategoryController");
const deleteCategoryController = require("../controllers/deleteCategoryController");
const getCategoryByIdController = require("../controllers/getCategoryByIdController");
const searchCategoriesController = require("../controllers/searchCategoriesController");
const updateCategoryController = require("../controllers/updateCategoryController");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

router.get("/search", searchCategoriesController);
router.get("/:id", getCategoryByIdController);
router.post("/", authenticateToken, createCategoryController);
router.put("/:id", authenticateToken, updateCategoryController);
router.delete("/:id", authenticateToken, deleteCategoryController);

module.exports = router;
