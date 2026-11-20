const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Product = require("./Product");

const ProductImage = sequelize.define(
  "ProductImage",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "product_images",
    timestamps: false,
  },
);

Product.hasMany(ProductImage, {
  foreignKey: "product_id",
  onDelete: "RESTRICT",
});
ProductImage.belongsTo(Product, {
  foreignKey: "product_id",
  onDelete: "RESTRICT",
});

module.exports = ProductImage;
