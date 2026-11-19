process.env.DB_NAME = "test_db";
process.env.DB_USER = "test_user";

const Category = require("../src/models/category");

describe("Category model", () => {
  test("defines the required columns and defaults", () => {
    expect(Category.options.tableName).toBe("categories");
    expect(Category.rawAttributes.id.primaryKey).toBe(true);
    expect(Category.rawAttributes.id.autoIncrement).toBe(true);
    expect(Category.rawAttributes.name.allowNull).toBe(false);
    expect(Category.rawAttributes.slug.allowNull).toBe(false);
    expect(Category.rawAttributes.use_in_menu.allowNull).toBe(true);
    expect(Category.rawAttributes.use_in_menu.defaultValue).toBe(false);
    expect(Category.options.timestamps).toBe(true);
    expect(Category.rawAttributes.created_at.field).toBe("created_at");
    expect(Category.rawAttributes.updated_at.field).toBe("updated_at");
  });
});
