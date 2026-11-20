const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Product = require("./Product");
const Category = require("./category");

const ProductCategory = sequelize.define(
  "ProductCategory",
  {
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Product,
        key: "id",
      },
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Category,
        key: "id",
      },
    },
  },
  {
    tableName: "product_categories",
    timestamps: false,
  },
);

Product.belongsToMany(Category, {
  through: ProductCategory,
  foreignKey: "product_id",
  otherKey: "category_id",
});

Category.belongsToMany(Product, {
  through: ProductCategory,
  foreignKey: "category_id",
  otherKey: "product_id",
});

module.exports = ProductCategory;
