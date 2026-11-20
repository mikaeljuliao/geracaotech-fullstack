process.env.DB_NAME = "test_db";
process.env.DB_USER = "test_user";
process.env.JWT_SECRET = "test-secret";

const jwt = require("jsonwebtoken");
const app = require("../src/app");
const Category = require("../src/models/category");

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

describe("GET /v1/category/search", () => {
  test("uses the default pagination and returns the list response", async () => {
    jest.spyOn(Category, "findAndCountAll").mockResolvedValue({
      count: 13,
      rows: [{ id: 1, name: "Shoes", slug: "shoes", use_in_menu: true }],
    });

    const response = await fetch(`${baseUrl}/v1/category/search`);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: [{ id: 1, name: "Shoes", slug: "shoes", use_in_menu: true }],
      total: 13,
      limit: 12,
      page: 1,
    });
    expect(Category.findAndCountAll).toHaveBeenCalledWith({
      where: {},
      attributes: ["id", "name", "slug", "use_in_menu"],
      order: [["id", "ASC"]],
      limit: 12,
      offset: 0,
    });
  });

  test("applies fields, menu filter, and no pagination when limit is -1", async () => {
    jest.spyOn(Category, "findAndCountAll").mockResolvedValue({
      count: 1,
      rows: [{ name: "Shoes", slug: "shoes" }],
    });

    const response = await fetch(
      `${baseUrl}/v1/category/search?limit=-1&page=3&fields=name,slug&use_in_menu=true`,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: [{ name: "Shoes", slug: "shoes" }],
      total: 1,
      limit: -1,
      page: 1,
    });
    expect(Category.findAndCountAll).toHaveBeenCalledWith({
      where: { use_in_menu: true },
      attributes: ["name", "slug"],
      order: [["id", "ASC"]],
    });
  });

  test("applies the requested page offset", async () => {
    jest.spyOn(Category, "findAndCountAll").mockResolvedValue({
      count: 30,
      rows: [],
    });

    const response = await fetch(
      `${baseUrl}/v1/category/search?limit=10&page=2`,
    );

    expect(response.status).toBe(200);
    expect(Category.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10, offset: 10 }),
    );
  });

  test.each([
    ["zero limit", "limit=0"],
    ["invalid page", "page=0"],
    ["unknown field", "fields=name,unknown"],
    ["invalid menu filter", "use_in_menu=yes"],
  ])("returns 400 for %s", async (_case, query) => {
    const findSpy = jest.spyOn(Category, "findAndCountAll");

    const response = await fetch(
      `${baseUrl}/v1/category/search?${query}`,
    );

    expect(response.status).toBe(400);
    expect(findSpy).not.toHaveBeenCalled();
  });
});

describe("GET /v1/category/:id", () => {
  test("returns category details when the category exists", async () => {
    jest.spyOn(Category, "findByPk").mockResolvedValue({
      id: 1,
      name: "Shoes",
      slug: "shoes",
      use_in_menu: true,
    });

    const response = await fetch(`${baseUrl}/v1/category/1`);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: 1,
      name: "Shoes",
      slug: "shoes",
      use_in_menu: true,
    });
    expect(Category.findByPk).toHaveBeenCalledWith("1", {
      attributes: ["id", "name", "slug", "use_in_menu"],
    });
  });

  describe("POST /v1/category", () => {
    const createToken = () =>
      jwt.sign({ sub: "test-user" }, process.env.JWT_SECRET);

    test.each([
      ["missing", undefined],
      ["invalid", "Bearer invalid-token"],
    ])("returns 401 for a %s token", async (_case, authorization) => {
      const createSpy = jest.spyOn(Category, "create");
      const headers = { "Content-Type": "application/json" };
      if (authorization) headers.Authorization = authorization;

      const response = await fetch(`${baseUrl}/v1/category`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name: "Shoes", slug: "shoes" }),
      });

      expect(response.status).toBe(401);
      expect(createSpy).not.toHaveBeenCalled();
    });

    test("creates a category and returns 201 without a body", async () => {
      jest.spyOn(Category, "create").mockResolvedValue(undefined);

      const response = await fetch(`${baseUrl}/v1/category`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${createToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Shoes",
          slug: "shoes",
          use_in_menu: true,
        }),
      });

      expect(response.status).toBe(201);
      expect(await response.text()).toBe("");
      expect(Category.create).toHaveBeenCalledWith({
        name: "Shoes",
        slug: "shoes",
        use_in_menu: true,
      });
    });

    test("omits use_in_menu when it is not provided", async () => {
      jest.spyOn(Category, "create").mockResolvedValue(undefined);

      const response = await fetch(`${baseUrl}/v1/category`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${createToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Shoes", slug: "shoes" }),
      });

      expect(response.status).toBe(201);
      expect(Category.create).toHaveBeenCalledWith({
        name: "Shoes",
        slug: "shoes",
      });
    });

    test.each([
      ["missing name", { slug: "shoes" }],
      ["missing slug", { name: "Shoes" }],
      [
        "non-boolean use_in_menu",
        { name: "Shoes", slug: "shoes", use_in_menu: "true" },
      ],
    ])("returns 400 for %s", async (_case, body) => {
      const createSpy = jest.spyOn(Category, "create");

      const response = await fetch(`${baseUrl}/v1/category`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${createToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      expect(response.status).toBe(400);
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  test("returns 404 when the category does not exist", async () => {
    jest.spyOn(Category, "findByPk").mockResolvedValue(null);

    const response = await fetch(`${baseUrl}/v1/category/999`);

    expect(response.status).toBe(404);
  });
});
