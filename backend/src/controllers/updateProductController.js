const fs = require("fs/promises");
const path = require("path");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const ProductOption = require("../models/ProductOption");
const ProductCategory = require("../models/ProductCategory");
const Category = require("../models/category");

function validImage(image) {
  if (
    !image ||
    (image.id !== undefined && (!Number.isInteger(image.id) || image.id < 1)) ||
    (image.deleted !== undefined && typeof image.deleted !== "boolean")
  ) {
    return false;
  }
  if (image.deleted === true) return Number.isInteger(image.id) && image.id > 0;
  return (
    typeof image.content === "string" &&
    (/^https?:\/\//.test(image.content) ||
      (["image/png", "image/jpg", "image/jpeg"].includes(image.type) &&
        /^[A-Za-z0-9+/]+={0,2}$/.test(image.content) &&
        image.content.length % 4 === 0))
  );
}

function validOption(option) {
  if (!option) return false;
  if (option.deleted !== undefined && typeof option.deleted !== "boolean") {
    return false;
  }
  if (option.deleted === true) return Number.isInteger(option.id) && option.id > 0;

  const values = option.values || option.value;
  return (
    (option.id === undefined || (Number.isInteger(option.id) && option.id > 0)) &&
    (option.title === undefined || typeof option.title === "string") &&
    (option.id !== undefined ||
      (typeof option.title === "string" &&
        Array.isArray(values) &&
        values.length > 0)) &&
    (values === undefined ||
      (Array.isArray(values) && values.every((value) => typeof value === "string"))) &&
    (option.shape === undefined || ["square", "circle"].includes(option.shape)) &&
    (option.type === undefined || ["text", "color"].includes(option.type)) &&
    (option.radius === undefined ||
      (typeof option.radius === "string"
        ? /^\d+px$/.test(option.radius)
        : Number.isInteger(option.radius) && option.radius >= 0))
  );
}

async function updateProductController(req, res) {
  const {
    enabled,
    name,
    slug,
    stock,
    description,
    price,
    price_with_discount,
    category_ids,
    images,
    options,
  } = req.body || {};

  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  if (
    typeof enabled !== "boolean" ||
    typeof name !== "string" ||
    !name ||
    typeof slug !== "string" ||
    !slug ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    typeof description !== "string" ||
    typeof price !== "number" ||
    price < 0 ||
    typeof price_with_discount !== "number" ||
    price_with_discount < 0 ||
    !Array.isArray(category_ids) ||
    !Array.isArray(images) ||
    !images.every(validImage) ||
    !Array.isArray(options) ||
    !options.every(validOption)
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
}

module.exports = updateProductController;
