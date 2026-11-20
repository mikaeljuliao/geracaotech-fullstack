process.env.DB_NAME = "test_db";
process.env.DB_USER = "test_user";

const Product = require("../src/models/Product");
const Category = require("../src/models/category");
const ProductCategory = require("../src/models/ProductCategory");

describe("ProductCategory model", () => {
  test("defines a composite key and required foreign keys", () => {
    expect(ProductCategory.options.tableName).toBe("product_categories");
    expect(ProductCategory.options.timestamps).toBe(false);
    expect(ProductCategory.rawAttributes.product_id.type.key).toBe("INTEGER");
    expect(ProductCategory.rawAttributes.product_id.allowNull).toBe(false);
    expect(ProductCategory.rawAttributes.product_id.primaryKey).toBe(true);
    expect(ProductCategory.rawAttributes.product_id.references.model).toBe(
      "products",
    );
    expect(ProductCategory.rawAttributes.category_id.type.key).toBe("INTEGER");
    expect(ProductCategory.rawAttributes.category_id.allowNull).toBe(false);
    expect(ProductCategory.rawAttributes.category_id.primaryKey).toBe(true);
    expect(ProductCategory.rawAttributes.category_id.references.model).toBe(
      "categories",
    );
  });

  test("uses explicit foreign keys in both many-to-many associations", () => {
    expect(Product.associations.Categories.foreignKey).toBe("product_id");
    expect(Product.associations.Categories.otherKey).toBe("category_id");
    expect(Category.associations.Products.foreignKey).toBe("category_id");
    expect(Category.associations.Products.otherKey).toBe("product_id");
  });
});
