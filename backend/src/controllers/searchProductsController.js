const { Op } = require("sequelize");
const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const ProductOption = require("../models/ProductOption");
const ProductCategory = require("../models/ProductCategory");
const Category = require("../models/category");

const defaultFields = [
  "id", "enabled", "name", "slug", "stock", "description", "price",
  "price_with_discount", "category_ids", "images", "options",
];
const allowedFields = [...defaultFields, "use_in_menu"];

async function searchProductsController(req, res) {
  const { query } = req;
  const badRequest = () =>
    res.status(400).json({ message: "Invalid query parameters" });
  const stringParams = ["limit", "fields", "match", "price-range", "category_ids"];
  if (stringParams.some((key) => query[key] !== undefined && typeof query[key] !== "string") ||
      (query.page !== undefined && query.limit !== "-1" && typeof query.page !== "string")) {
    return badRequest();
  }

  const limit = query.limit === undefined ? 12 : Number(query.limit);
  const page =
    limit === -1 || query.page === undefined ? 1 : Number(query.page);
  const fields =
    query.fields === undefined ? defaultFields : query.fields.split(",");

  if (
    !Number.isInteger(limit) ||
    (limit !== -1 && limit < 1) ||
    !Number.isInteger(page) ||
    page < 1 ||
    fields.some((field) => !allowedFields.includes(field))
  ) {
    return badRequest();
  }

  const where = {};

  if (query.match !== undefined) {
    if (typeof query.match !== "string" || !query.match) return badRequest();
    where[Op.or] = [
      { name: { [Op.like]: `%${query.match}%` } },
      { description: { [Op.like]: `%${query.match}%` } },
    ];
  }

  if (query["price-range"] !== undefined) {
    const match = query["price-range"].match(
      /^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/,
    );
    const range = match ? match.slice(1).map(Number) : [];
    if (
      range.length !== 2 ||
      range.some((price) => !Number.isFinite(price)) ||
      range[0] > range[1]
    ) {
      return badRequest();
    }
    where.price = { [Op.between]: range };
  }

  const productIdSets = [];
  if (query.category_ids !== undefined) {
    const ids = query.category_ids.split(",").map(Number);
    if (!ids.length || ids.some((id) => !Number.isInteger(id) || id < 1)) {
      return badRequest();
    }
    const categories = await ProductCategory.findAll({
      attributes: ["product_id"],
      where: { category_id: { [Op.in]: ids } },
      raw: true,
    });
    productIdSets.push(new Set(categories.map((row) => row.product_id)));
  }

  const optionFilters = Object.entries(query)
    .filter(([key]) => key.startsWith("option["))
    .map(([key, value]) => {
      const match = key.match(/^option\[(\d+)\]$/);
      return match && typeof value === "string"
        ? { id: Number(match[1]), values: value.split(",") }
        : null;
    });
  if (optionFilters.includes(null)) return badRequest();

  for (const { id, values } of optionFilters) {
    if (id < 1 || values.some((value) => !value)) return badRequest();
    const patterns = values.flatMap((value) => [value, `${value},%`, `%,${value},%`, `%,${value}`]);
    const matches = await ProductOption.findAll({
      attributes: ["product_id"],
      where: {
        id,
        [Op.or]: patterns.map((value) => ({ values: { [Op.like]: value } })),
      },
      raw: true,
    });
    productIdSets.push(new Set(matches.map((row) => row.product_id)));
  }

  if (productIdSets.length) {
    const [first, ...rest] = productIdSets;
    where.id = {
      [Op.in]: [...first].filter((id) => rest.every((set) => set.has(id))),
    };
  }

  const relations = ["category_ids", "images", "options"];
  const fieldsWithoutRelations = fields.filter((field) => !relations.includes(field));
  const include = [];
  if (fields.includes("images")) {
    include.push({ model: ProductImage, as: "ProductImages", attributes: ["id", "path"] });
  }
  if (fields.includes("options")) {
    include.push({
      model: ProductOption,
      as: "ProductOptions",
      attributes: ["id", "title", "shape", "radius", "type", "values"],
    });
  }
  if (fields.includes("category_ids")) {
    include.push({
      model: Category,
      as: "Categories",
      attributes: ["id"],
      through: { attributes: [] },
    });
  }

  const findOptions = {
    where,
    attributes: fieldsWithoutRelations.length
      ? fieldsWithoutRelations
      : ["id"],
    include,
    distinct: true,
    order: [["id", "ASC"]],
  };
  if (limit !== -1) {
    findOptions.limit = limit;
    findOptions.offset = (page - 1) * limit;
  }

  const { count, rows } = await Product.findAndCountAll(findOptions);
  const data = rows.map((row) => {
    const product = row.get({ plain: true });
    const item = Object.fromEntries(
      fieldsWithoutRelations.map((field) => [field, product[field]]),
    );
    if (fields.includes("images")) {
      item.images = product.ProductImages.map(({ id, path }) => ({ id, content: path }));
    }
    if (fields.includes("options")) item.options = product.ProductOptions;
    if (fields.includes("category_ids")) {
      item.category_ids = product.Categories.map(({ id }) => id);
    }
    return item;
  });

  return res.status(200).json({ data, total: count, limit, page });
}

module.exports = searchProductsController;
