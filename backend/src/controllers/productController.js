const fs = require("fs/promises");
const path = require("path");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
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

function formatImagePath(req, imgPath) {
  if (!imgPath) return "/featured-k-swiss.png";
  if (/^https?:\/\//.test(imgPath)) return imgPath;
  if (imgPath.startsWith("media/")) {
    return `${req.protocol}://${req.get("host")}/${imgPath}`;
  }
  return imgPath.startsWith("/") ? imgPath : `/${imgPath}`;
}

function validOption(option) {
  if (!option || typeof option.title !== "string" || !option.title) return false;

  const values = option.values || option.value;
  const radius = option.radius || 0;
  return (
    Array.isArray(values) &&
    values.length > 0 &&
    values.every((value) => typeof value === "string") &&
    ["square", "circle"].includes(option.shape || "square") &&
    ["text", "color"].includes(option.type || "text") &&
    (typeof radius === "string"
      ? /^\d+px$/.test(radius)
      : Number.isInteger(radius) && radius >= 0)
  );
}

const productController = {
  // GET /v1/product/search
  async search(req, res) {
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
        item.images = product.ProductImages.map(({ id, path: p }) => ({
          id,
          content: formatImagePath(req, p),
        }));
      }
      if (fields.includes("options")) item.options = product.ProductOptions;
      if (fields.includes("category_ids")) {
        item.category_ids = product.Categories.map(({ id }) => id);
      }
      return item;
    });

    return res.status(200).json({ data, total: count, limit, page });
  },

  // GET /v1/product/:id
  async getById(req, res) {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: ProductImage, as: "ProductImages", attributes: ["id", "path"] },
        {
          model: ProductOption,
          as: "ProductOptions",
          attributes: ["id", "title", "shape", "radius", "type", "values"],
        },
        {
          model: Category,
          as: "Categories",
          attributes: ["id"],
          through: { attributes: [] },
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const data = product.get({ plain: true });

    return res.status(200).json({
      id: data.id,
      enabled: data.enabled,
      name: data.name,
      slug: data.slug,
      stock: data.stock,
      description: data.description,
      price: data.price,
      price_with_discount: data.price_with_discount,
      category_ids: data.Categories.map(({ id }) => id),
      images: data.ProductImages.map(({ id, path: p }) => ({
        id,
        content: formatImagePath(req, p),
      })),
      options: data.ProductOptions,
    });
  },

  // POST /v1/product
  async create(req, res) {
    const {
      enabled,
      name,
      slug,
      stock,
      description,
      price,
      price_with_discount,
      category_ids = [],
      images = [],
      options = [],
    } = req.body || {};

    const validImages =
      Array.isArray(images) &&
      images.every(
        (image) =>
          image &&
          ["image/png", "image/jpg", "image/jpeg"].includes(image.type) &&
          typeof image.content === "string" &&
          /^[A-Za-z0-9+/]+={0,2}$/.test(image.content) &&
          image.content.length % 4 === 0,
      );
    const validOptions =
      Array.isArray(options) &&
      options.every(validOption);

    if (
      !name ||
      !slug ||
      typeof name !== "string" ||
      typeof slug !== "string" ||
      (enabled !== undefined && typeof enabled !== "boolean") ||
      (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) ||
      (description !== undefined && typeof description !== "string") ||
      typeof price !== "number" ||
      typeof price_with_discount !== "number" ||
      !Array.isArray(category_ids) ||
      category_ids.some((id) => !Number.isInteger(id) || id < 1) ||
      !Array.isArray(images) ||
      !validImages ||
      !Array.isArray(options) ||
      !validOptions
    ) {
      return res.status(400).json({ message: "Invalid product data" });
    }

    const categories = await Category.findAll({
      attributes: ["id"],
      where: { id: { [Op.in]: category_ids } },
      raw: true,
    });
    if (categories.length !== category_ids.length) {
      return res.status(400).json({ message: "Invalid category IDs" });
    }

    const transaction = await sequelize.transaction();
    let imageDirectory;

    try {
      const product = await Product.create(
        { enabled, name, slug, stock, description, price, price_with_discount },
        { transaction },
      );

      if (images.length) {
        imageDirectory = path.join(
          __dirname,
          "../../media/products",
          String(product.id),
        );
        await fs.mkdir(imageDirectory, { recursive: true });

        for (let i = 0; i < images.length; i += 1) {
          const image = images[i];
          const extension = image.type === "image/png" ? "png" : "jpg";
          const fileName = `image-${i + 1}.${extension}`;
          const filePath = path.join(imageDirectory, fileName);
          await fs.writeFile(filePath, Buffer.from(image.content, "base64"));
          await ProductImage.create(
            {
              product_id: product.id,
              path: `media/products/${product.id}/${fileName}`,
            },
            { transaction },
          );
        }
      }

      for (const option of options) {
        const radius = option.radius || 0;
        await ProductOption.create(
          {
            product_id: product.id,
            title: option.title,
            shape: option.shape || "square",
            radius: typeof radius === "string" ? parseInt(radius, 10) : radius,
            type: option.type || "text",
            values: (option.values || option.value).join(","),
          },
          { transaction },
        );
      }

      for (const category_id of category_ids) {
        await ProductCategory.create(
          { product_id: product.id, category_id },
          { transaction },
        );
      }

      await transaction.commit();
      return res.status(201).send();
    } catch (error) {
      await transaction.rollback();
      if (imageDirectory) {
        await fs.rm(imageDirectory, { recursive: true, force: true });
      }
      throw error;
    }
  },

  // PUT /v1/product/:id
  async update(req, res) {
    const {
      enabled,
      name,
      slug,
      stock,
      description,
      price,
      price_with_discount,
      category_ids = [],
      images = [],
      options = [],
    } = req.body || {};

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const validImages =
      Array.isArray(images) &&
      images.every((image) => {
        if (!image) return false;
        if (image.deleted) return Boolean(image.id);
        const hasContent = typeof image.content === "string";
        const isUrl = hasContent && /^https?:\/\//.test(image.content);
        const isBase64 =
          hasContent &&
          /^[A-Za-z0-9+/]+={0,2}$/.test(image.content) &&
          image.content.length % 4 === 0 &&
          ["image/png", "image/jpg", "image/jpeg"].includes(image.type);
        return isUrl || isBase64;
      });

    const validOptions =
      Array.isArray(options) &&
      options.every((option) => (option && option.deleted ? Boolean(option.id) : validOption(option)));

    if (
      !name ||
      !slug ||
      typeof name !== "string" ||
      typeof slug !== "string" ||
      (enabled !== undefined && typeof enabled !== "boolean") ||
      (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) ||
      (description !== undefined && typeof description !== "string") ||
      typeof price !== "number" ||
      typeof price_with_discount !== "number" ||
      !Array.isArray(category_ids) ||
      category_ids.some((id) => !Number.isInteger(id) || id < 1) ||
      !Array.isArray(images) ||
      !validImages ||
      !Array.isArray(options) ||
      !validOptions
    ) {
      return res.status(400).json({ message: "Invalid product data" });
    }

    const categories = await Category.findAll({
      attributes: ["id"],
      where: { id: { [Op.in]: category_ids } },
      raw: true,
    });
    if (categories.length !== category_ids.length) {
      return res.status(400).json({ message: "Invalid category IDs" });
    }

    const imageIds = images.map(({ id }) => id).filter(Boolean);
    const optionIds = options.map(({ id }) => id).filter(Boolean);
    const productImages = await ProductImage.findAll({
      where: { product_id: product.id, id: imageIds },
    });
    const productOptions = await ProductOption.findAll({
      where: { product_id: product.id, id: optionIds },
    });
    if (
      productImages.length !== new Set(imageIds).size ||
      productOptions.length !== new Set(optionIds).size
    ) {
      return res.status(400).json({ message: "Invalid image or option ID" });
    }

    const transaction = await sequelize.transaction();
    const files = [];

    try {
      await product.update(
        { enabled, name, slug, stock, description, price, price_with_discount },
        { transaction },
      );
      await ProductCategory.destroy({
        where: { product_id: product.id },
        transaction,
      });
      if (category_ids.length) {
        await ProductCategory.bulkCreate(
          category_ids.map((category_id) => ({
            product_id: product.id,
            category_id,
          })),
          { transaction },
        );
      }

      for (let index = 0; index < images.length; index += 1) {
        const image = images[index];
        const current = productImages.find((item) => item.id === image.id);
        if (image.deleted) {
          await current.destroy({ transaction });
          continue;
        }

        let imagePath = image.content;
        if (!/^https?:\/\//.test(image.content)) {
          const directory = path.join(
            __dirname,
            "../../media/products",
            String(product.id),
          );
          const extension = image.type === "image/png" ? "png" : "jpg";
          const fileName = `image-${Date.now()}-${index + 1}.${extension}`;
          const filePath = path.join(directory, fileName);
          await fs.mkdir(directory, { recursive: true });
          await fs.writeFile(filePath, Buffer.from(image.content, "base64"));
          files.push(filePath);
          imagePath = `media/products/${product.id}/${fileName}`;
        }

        if (current) await current.update({ path: imagePath }, { transaction });
        else
          await ProductImage.create(
            { product_id: product.id, path: imagePath },
            { transaction },
          );
      }

      for (const option of options) {
        const current = productOptions.find((item) => item.id === option.id);
        if (option.deleted) {
          await current.destroy({ transaction });
          continue;
        }

        const values = option.values || option.value;
        const radius =
          typeof option.radius === "string"
            ? parseInt(option.radius, 10)
            : option.radius;
        const data = {
          ...(option.title !== undefined && { title: option.title }),
          ...(option.shape !== undefined && { shape: option.shape }),
          ...(radius !== undefined && { radius }),
          ...(option.type !== undefined && { type: option.type }),
          ...(values !== undefined && { values: values.join(",") }),
        };
        if (current) await current.update(data, { transaction });
        else
          await ProductOption.create(
            { ...data, product_id: product.id },
            { transaction },
          );
      }

      await transaction.commit();
      return res.status(204).send();
    } catch (error) {
      await transaction.rollback();
      for (const file of files) await fs.rm(file, { force: true });
      throw error;
    }
  },

  // DELETE /v1/product/:id
  async delete(req, res) {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const transaction = await sequelize.transaction();
    try {
      const where = { product_id: product.id };
      await ProductCategory.destroy({ where, transaction });
      await ProductImage.destroy({ where, transaction });
      await ProductOption.destroy({ where, transaction });
      await product.destroy({ transaction });
      await transaction.commit();
      return res.status(204).send();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};

module.exports = productController;
