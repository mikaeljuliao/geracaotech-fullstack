const Category = require("../models/category");

async function updateCategoryController(req, res) {
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

  const category = await Category.findByPk(req.params.id);

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const categoryData = { name, slug };
  if (use_in_menu !== undefined) {
    categoryData.use_in_menu = use_in_menu;
  }

  await category.update(categoryData);

  return res.status(204).send();
}

module.exports = updateCategoryController;
