process.env.DB_NAME = "test_db";
process.env.DB_USER = "test_user";

const bcrypt = require("bcrypt");
const User = require("../src/models/User");

describe("User model", () => {
  test("defines the required columns and timestamp names", () => {
    expect(User.rawAttributes.id.primaryKey).toBe(true);
    expect(User.rawAttributes.id.autoIncrement).toBe(true);
    expect(User.rawAttributes.firstname.allowNull).toBe(false);
    expect(User.rawAttributes.surname.allowNull).toBe(false);
    expect(User.rawAttributes.email.allowNull).toBe(false);
    expect(User.rawAttributes.password.allowNull).toBe(false);
    expect(User.options.timestamps).toBe(true);
    expect(User.rawAttributes.created_at.field).toBe("created_at");
    expect(User.rawAttributes.updated_at.field).toBe("updated_at");
  });

  test("hashes the password before saving", async () => {
    const plainPassword = "secret123";
    const user = User.build({ password: plainPassword });

    await User.runHooks("beforeSave", user);

    expect(user.password).not.toBe(plainPassword);
    await expect(bcrypt.compare(plainPassword, user.password)).resolves.toBe(
      true,
    );
  });
});
