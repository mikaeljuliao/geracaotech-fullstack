process.env.DB_NAME = "test_db";
process.env.DB_USER = "test_user";
process.env.JWT_SECRET = "test-secret";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = require("../src/app");
const User = require("../src/models/User");

let server;
let baseUrl;

beforeAll(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("GET /v1/user/:id", () => {
  test("returns public user fields when the user exists", async () => {
    jest.spyOn(User, "findByPk").mockResolvedValue({
      id: 1,
      firstname: "Ada",
      surname: "Lovelace",
      email: "ada@example.com",
    });

    const response = await fetch(`${baseUrl}/v1/user/1`);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: 1,
      firstname: "Ada",
      surname: "Lovelace",
      email: "ada@example.com",
    });
    expect(User.findByPk).toHaveBeenCalledWith("1", {
      attributes: ["id", "firstname", "surname", "email"],
    });
  });

  test("returns 404 when the user does not exist", async () => {
    jest.spyOn(User, "findByPk").mockResolvedValue(null);

    const response = await fetch(`${baseUrl}/v1/user/999`);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      message: "User not found",
    });
  });
});

describe("POST /v1/user", () => {
  test("creates a user and returns 201 without a response body", async () => {
    jest.spyOn(User, "create").mockResolvedValue(undefined);

    const response = await fetch(`${baseUrl}/v1/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstname: "Grace",
        surname: "Hopper",
        email: "grace@example.com",
        password: "secret123",
        confirmPassword: "secret123",
      }),
    });

    expect(response.status).toBe(201);
    expect(await response.text()).toBe("");
    expect(User.create).toHaveBeenCalledWith({
      firstname: "Grace",
      surname: "Hopper",
      email: "grace@example.com",
      password: "secret123",
    });
  });

  describe("POST /v1/user/token", () => {
    test("returns a JWT for valid credentials", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue({
        id: 7,
        password: "hashed-password",
      });
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

      const response = await fetch(`${baseUrl}/v1/user/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "user@mail.com", password: "123@123" }),
      });

      expect(response.status).toBe(200);
      const { token } = await response.json();
      expect(jwt.verify(token, process.env.JWT_SECRET).sub).toBe("7");
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "123@123",
        "hashed-password",
      );
    });

    test.each([
      {},
      { email: "user@mail.com" },
      { email: "user@mail.com", password: "wrong-password" },
    ])("returns 400 for invalid credentials", async (body) => {
      jest.spyOn(User, "findOne").mockResolvedValue({
        id: 7,
        password: "hashed-password",
      });
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

      const response = await fetch(`${baseUrl}/v1/user/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      expect(response.status).toBe(400);
    });
  });

  describe("PUT /v1/user/:id", () => {
    const createToken = () => jwt.sign({ sub: "test-user" }, process.env.JWT_SECRET);

    test.each([
      ["missing", undefined],
      ["invalid", "Bearer invalid-token"],
    ])("returns 400 for a %s token", async (_case, authorization) => {
      const findByPkSpy = jest.spyOn(User, "findByPk");
      const headers = { "Content-Type": "application/json" };
      if (authorization) headers.Authorization = authorization;

      const response = await fetch(`${baseUrl}/v1/user/1`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          firstname: "Ada",
          surname: "Lovelace",
          email: "ada@example.com",
        }),
      });

      expect(response.status).toBe(400);
      expect(findByPkSpy).not.toHaveBeenCalled();
    });

    test("updates an existing user and returns 204 without a body", async () => {
      const update = jest.fn().mockResolvedValue(undefined);
      jest.spyOn(User, "findByPk").mockResolvedValue({ update });

      const response = await fetch(`${baseUrl}/v1/user/1`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${createToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: "Ada",
          surname: "Lovelace",
          email: "ada@example.com",
        }),
      });

      expect(response.status).toBe(204);
      expect(await response.text()).toBe("");
      expect(User.findByPk).toHaveBeenCalledWith("1");
      expect(update).toHaveBeenCalledWith({
        firstname: "Ada",
        surname: "Lovelace",
        email: "ada@example.com",
      });
    });

    describe("DELETE /v1/user/:id", () => {
      const createToken = () => jwt.sign({ sub: "test-user" }, process.env.JWT_SECRET);

      test.each([
        ["missing", undefined],
        ["invalid", "Bearer invalid-token"],
      ])("returns 400 for a %s token", async (_case, authorization) => {
        const findByPkSpy = jest.spyOn(User, "findByPk");
        const headers = {};
        if (authorization) headers.Authorization = authorization;

        const response = await fetch(`${baseUrl}/v1/user/1`, {
          method: "DELETE",
          headers,
        });

        expect(response.status).toBe(400);
        expect(findByPkSpy).not.toHaveBeenCalled();
      });

      test("deletes an existing user and returns 204 without a body", async () => {
        const destroy = jest.fn().mockResolvedValue(undefined);
        jest.spyOn(User, "findByPk").mockResolvedValue({ destroy });

        const response = await fetch(`${baseUrl}/v1/user/1`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${createToken()}` },
        });

        expect(response.status).toBe(204);
        expect(await response.text()).toBe("");
        expect(User.findByPk).toHaveBeenCalledWith("1");
        expect(destroy).toHaveBeenCalledTimes(1);
      });

      test("returns 404 when the user does not exist", async () => {
        jest.spyOn(User, "findByPk").mockResolvedValue(null);

        const response = await fetch(`${baseUrl}/v1/user/999`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${createToken()}` },
        });

        expect(response.status).toBe(404);
      });
    });

    test("returns 400 when required user data is missing", async () => {
      const findByPkSpy = jest.spyOn(User, "findByPk");

      const response = await fetch(`${baseUrl}/v1/user/1`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${createToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstname: "Ada" }),
      });

      expect(response.status).toBe(400);
      expect(findByPkSpy).not.toHaveBeenCalled();
    });

    test("returns 404 when the user does not exist", async () => {
      jest.spyOn(User, "findByPk").mockResolvedValue(null);

      const response = await fetch(`${baseUrl}/v1/user/999`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${createToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: "Ada",
          surname: "Lovelace",
          email: "ada@example.com",
        }),
      });

      expect(response.status).toBe(404);
    });
  });

  test.each([
    ["missing required data", { firstname: "Grace" }],
    [
      "mismatched passwords",
      {
        firstname: "Grace",
        surname: "Hopper",
        email: "grace@example.com",
        password: "secret123",
        confirmPassword: "different",
      },
    ],
  ])("returns 400 for %s", async (_case, body) => {
    const createSpy = jest.spyOn(User, "create");

    const response = await fetch(`${baseUrl}/v1/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    expect(response.status).toBe(400);
    expect(createSpy).not.toHaveBeenCalled();
  });
});
