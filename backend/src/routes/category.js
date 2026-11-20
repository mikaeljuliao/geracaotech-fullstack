const express = require("express");
const getCategoryByIdController = require("../controllers/getCategoryByIdController");
const searchCategoriesController = require("../controllers/searchCategoriesController");

const router = express.Router();

router.get("/search", searchCategoriesController);
router.get("/:id", getCategoryByIdController);

module.exports = router;
