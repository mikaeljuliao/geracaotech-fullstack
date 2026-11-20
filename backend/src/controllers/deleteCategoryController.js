const Category = require("../models/category");

async function deleteCategoryController(req, res) {
  const category = await Category.findByPk(req.params.id);

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  await category.destroy();

  return res.status(204).send();
}

module.exports = deleteCategoryController;
