const Category = require("../models/category");

async function createCategoryController(req, res) {
  const { name, slug, use_in_menu } = req.body || {};

  if (
    typeof name !== "string" ||
    !name ||
    typeof slug !== "string" ||
    !slug ||
    (use_in_menu !== undefined && typeof use_in_menu !== "boolean")
  ) {
    return res.status(400).json({ message: "Invalid category data" });
  }

  const categoryData = { name, slug };
  if (use_in_menu !== undefined) {
    categoryData.use_in_menu = use_in_menu;
  }

  await Category.create(categoryData);

  return res.status(201).send();
}

module.exports = createCategoryController;
