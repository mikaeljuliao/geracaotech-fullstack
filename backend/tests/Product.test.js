process.env.DB_NAME = "test_db";
process.env.DB_USER = "test_user";

const Product = require("../src/models/Product");

describe("Product model", () => {
  test("defines the required columns, defaults, and timestamps", () => {
    expect(Product.options.tableName).toBe("products");
    expect(Product.rawAttributes.id.type.key).toBe("INTEGER");
    expect(Product.rawAttributes.id.primaryKey).toBe(true);
    expect(Product.rawAttributes.id.autoIncrement).toBe(true);
    expect(Product.rawAttributes.enabled.type.key).toBe("BOOLEAN");
    expect(Product.rawAttributes.enabled.allowNull).toBe(true);
    expect(Product.rawAttributes.enabled.defaultValue).toBe(false);
    expect(Product.rawAttributes.name.type.key).toBe("STRING");
    expect(Product.rawAttributes.name.allowNull).toBe(false);
    expect(Product.rawAttributes.slug.type.key).toBe("STRING");
    expect(Product.rawAttributes.slug.allowNull).toBe(false);
    expect(Product.rawAttributes.use_in_menu.type.key).toBe("BOOLEAN");
    expect(Product.rawAttributes.use_in_menu.allowNull).toBe(true);
    expect(Product.rawAttributes.use_in_menu.defaultValue).toBe(false);
    expect(Product.rawAttributes.stock.type.key).toBe("INTEGER");
    expect(Product.rawAttributes.stock.allowNull).toBe(true);
    expect(Product.rawAttributes.stock.defaultValue).toBe(0);
    expect(Product.rawAttributes.description.type.key).toBe("STRING");
    expect(Product.rawAttributes.description.allowNull).toBe(true);
    expect(Product.rawAttributes.price.type.key).toBe("FLOAT");
    expect(Product.rawAttributes.price.allowNull).toBe(false);
    expect(Product.rawAttributes.price_with_discount.type.key).toBe("FLOAT");
    expect(Product.rawAttributes.price_with_discount.allowNull).toBe(false);
    expect(Product.options.timestamps).toBe(true);
    expect(Product.rawAttributes.created_at.field).toBe("created_at");
    expect(Product.rawAttributes.updated_at.field).toBe("updated_at");
  });
});
