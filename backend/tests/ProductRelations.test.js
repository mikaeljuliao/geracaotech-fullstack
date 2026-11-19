process.env.DB_NAME = "test_db";
process.env.DB_USER = "test_user";

const Product = require("../src/models/Product");
const ProductImage = require("../src/models/ProductImage");
const ProductOption = require("../src/models/ProductOption");

describe("Product image model", () => {
  test("defines required columns and a product foreign key", () => {
    expect(ProductImage.options.tableName).toBe("product_images");
    expect(ProductImage.rawAttributes.id.primaryKey).toBe(true);
    expect(ProductImage.rawAttributes.id.autoIncrement).toBe(true);
    expect(ProductImage.rawAttributes.product_id.allowNull).toBe(false);
    expect(ProductImage.rawAttributes.product_id.references.model).toBe(
      "products",
    );
    expect(ProductImage.rawAttributes.enabled.allowNull).toBe(true);
    expect(ProductImage.rawAttributes.enabled.defaultValue).toBe(false);
    expect(ProductImage.rawAttributes.path.allowNull).toBe(false);
    expect(ProductImage.options.timestamps).toBe(false);
    expect(Product.associations.ProductImages).toBeDefined();
  });
});

describe("Product option model", () => {
  test("defines required columns, defaults, enums, and product foreign key", () => {
    expect(ProductOption.options.tableName).toBe("product_options");
    expect(ProductOption.rawAttributes.id.primaryKey).toBe(true);
    expect(ProductOption.rawAttributes.id.autoIncrement).toBe(true);
    expect(ProductOption.rawAttributes.product_id.allowNull).toBe(false);
    expect(ProductOption.rawAttributes.product_id.references.model).toBe(
      "products",
    );
    expect(ProductOption.rawAttributes.title.allowNull).toBe(false);
    expect(ProductOption.rawAttributes.shape.type.values).toEqual([
      "square",
      "circle",
    ]);
    expect(ProductOption.rawAttributes.shape.allowNull).toBe(true);
    expect(ProductOption.rawAttributes.shape.defaultValue).toBe("square");
    expect(ProductOption.rawAttributes.radius.type.key).toBe("INTEGER");
    expect(ProductOption.rawAttributes.radius.allowNull).toBe(true);
    expect(ProductOption.rawAttributes.radius.defaultValue).toBe(0);
    expect(ProductOption.rawAttributes.type.type.values).toEqual([
      "text",
      "color",
    ]);
    expect(ProductOption.rawAttributes.type.allowNull).toBe(true);
    expect(ProductOption.rawAttributes.type.defaultValue).toBe("text");
    expect(ProductOption.rawAttributes.values.type.key).toBe("STRING");
    expect(ProductOption.rawAttributes.values.allowNull).toBe(false);
    expect(ProductOption.options.timestamps).toBe(false);
    expect(Product.associations.ProductOptions).toBeDefined();
  });
});
