const fs = require("fs/promises");
const path = require("path");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const ProductOption = require("../models/ProductOption");
const ProductCategory = require("../models/ProductCategory");
const Category = require("../models/category");

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

async function createProductController(req, res) {
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
}

module.exports = createProductController;
