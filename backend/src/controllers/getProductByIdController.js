const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const ProductOption = require("../models/ProductOption");
const Category = require("../models/category");
require("../models/ProductCategory");

function formatImagePath(req, path) {
  if (!path) return "/featured-k-swiss.png";
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith("media/")) {
    return `${req.protocol}://${req.get("host")}/${path}`;
  }
  return path.startsWith("/") ? path : `/${path}`;
}

async function getProductByIdController(req, res) {
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
    images: data.ProductImages.map(({ id, path }) => ({
      id,
      content: formatImagePath(req, path),
    })),
    options: data.ProductOptions,
  });
}

module.exports = getProductByIdController;
