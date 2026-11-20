const sequelize = require("../config/database");
const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const ProductOption = require("../models/ProductOption");
const ProductCategory = require("../models/ProductCategory");

async function deleteProductController(req, res) {
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
}

module.exports = deleteProductController;
