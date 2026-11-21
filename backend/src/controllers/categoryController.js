const Category = require("../models/category");

const categoryFields = ["id", "name", "slug", "use_in_menu"];

function parsePositiveInteger(value) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isSafeInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : null;
}

const categoryController = {
  // GET /v1/category/search
  async search(req, res) {
    const query = req.query;
    let limit = 12;
    let page = 1;

    if (query.limit !== undefined) {
      if (typeof query.limit !== "string" || !/^-?\d+$/.test(query.limit)) {
        return res.status(400).json({ message: "Invalid query parameters" });
      }

      limit = Number(query.limit);
      if (!Number.isSafeInteger(limit) || (limit !== -1 && limit <= 0)) {
        return res.status(400).json({ message: "Invalid query parameters" });
      }
    }

    if (limit !== -1 && query.page !== undefined) {
      page = parsePositiveInteger(query.page);
      if (page === null) {
        return res.status(400).json({ message: "Invalid query parameters" });
      }
    }

    let attributes = categoryFields;
    if (query.fields !== undefined) {
      if (typeof query.fields !== "string") {
        return res.status(400).json({ message: "Invalid query parameters" });
      }

      attributes = query.fields.split(",");
      if (
        attributes.length === 0 ||
        attributes.some(
          (field) => !categoryFields.includes(field) || field.length === 0,
        )
      ) {
        return res.status(400).json({ message: "Invalid query parameters" });
      }
    }

    const where = {};
    if (query.use_in_menu !== undefined) {
      if (query.use_in_menu !== "true" && query.use_in_menu !== "false") {
        return res.status(400).json({ message: "Invalid query parameters" });
      }
      where.use_in_menu = query.use_in_menu === "true";
    }

    const options = {
      where,
      attributes,
      order: [["id", "ASC"]],
    };

    if (limit !== -1) {
      options.limit = limit;
      options.offset = (page - 1) * limit;
    }

    const { count, rows } = await Category.findAndCountAll(options);

    return res.status(200).json({
      data: rows,
      total: count,
      limit,
      page,
    });
  },

  // GET /v1/category/:id
  async getById(req, res) {
    const category = await Category.findByPk(req.params.id, {
      attributes: ["id", "name", "slug", "use_in_menu"],
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json(category);
  },

  // POST /v1/category
  async create(req, res) {
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
  },

  // PUT /v1/category/:id
  async update(req, res) {
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
  },

  // DELETE /v1/category/:id
  async delete(req, res) {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.destroy();

    return res.status(204).send();
  },
};

module.exports = categoryController;
