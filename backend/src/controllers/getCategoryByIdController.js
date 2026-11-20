const Category = require("../models/category");

async function getCategoryByIdController(req, res) {
  const category = await Category.findByPk(req.params.id, {
    attributes: ["id", "name", "slug", "use_in_menu"],
  });

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  return res.status(200).json(category);
}

module.exports = getCategoryByIdController;
