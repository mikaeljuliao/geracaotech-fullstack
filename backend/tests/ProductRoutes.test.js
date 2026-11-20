process.env.DB_NAME = "test_db";
process.env.DB_USER = "test_user";
process.env.JWT_SECRET = "test-secret";

const fs = require("fs/promises");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const app = require("../src/app");
const sequelize = require("../src/config/database");
const Product = require("../src/models/Product");
const ProductImage = require("../src/models/ProductImage");
const ProductOption = require("../src/models/ProductOption");
const ProductCategory = require("../src/models/ProductCategory");
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

afterEach(() => jest.restoreAllMocks());

describe("GET /v1/product/search", () => {
  test("returns product data and default pagination", async () => {
    const product = {
      id: 1,
      enabled: true,
      name: "Sneaker",
      slug: "sneaker",
      stock: 5,
      description: "Lightweight shoe",
      price: 120,
      price_with_discount: 100,
      ProductImages: [{ id: 2, path: "media/products/sneaker.png" }],
      ProductOptions: [{ id: 3, title: "Size", values: "S,M" }],
      Categories: [{ id: 4 }],
    };
    jest.spyOn(Product, "findAndCountAll").mockResolvedValue({
      count: 1,
      rows: [{ get: () => product }],
    });

    const response = await fetch(`${baseUrl}/v1/product/search`);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: [
        {
          id: 1,
          name: "Sneaker",
          category_ids: [4],
          images: [{ id: 2, content: "media/products/sneaker.png" }],
          options: product.ProductOptions,
        },
      ],
      total: 1,
      limit: 12,
      page: 1,
    });
    expect(Product.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 12, offset: 0 }),
    );
  });

  test("supports fields and limit=-1 without pagination", async () => {
    jest.spyOn(Product, "findAndCountAll").mockResolvedValue({
      count: 0,
      rows: [],
    });

    const response = await fetch(
      `${baseUrl}/v1/product/search?fields=name,images,price&limit=-1&page=invalid`,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: [],
      limit: -1,
      page: 1,
    });
    const [options] = Product.findAndCountAll.mock.calls[0];
    expect(options.attributes).toEqual(["name", "price"]);
    expect(options).not.toHaveProperty("limit");
    expect(options).not.toHaveProperty("offset");
  });

  test("applies text, price, category, and option filters", async () => {
    jest.spyOn(ProductCategory, "findAll").mockResolvedValue([
      { product_id: 1 },
      { product_id: 2 },
    ]);
    jest.spyOn(ProductOption, "findAll").mockResolvedValue([
      { product_id: 2 },
      { product_id: 3 },
    ]);
    jest.spyOn(Product, "findAndCountAll").mockResolvedValue({
      count: 0,
      rows: [],
    });

    const response = await fetch(
      `${baseUrl}/v1/product/search?match=shoe&category_ids=4,5&price-range=100-200&option%5B45%5D=GG,PP`,
    );

    expect(response.status).toBe(200);
    const [options] = Product.findAndCountAll.mock.calls[0];
    expect(options.where.id[Op.in]).toEqual([2]);
    expect(options.where.price[Op.between]).toEqual([100, 200]);
    expect(options.where[Op.or]).toEqual([
      { name: { [Op.like]: "%shoe%" } },
      { description: { [Op.like]: "%shoe%" } },
    ]);
  });

  test.each([
    "limit=0",
    "fields=name,unknown",
    "price-range=200-100",
    "category_ids=1,nope",
    "option%5Babc%5D=XL",
  ])("returns 400 for invalid query %s", async (query) => {
    const findSpy = jest.spyOn(Product, "findAndCountAll");
    const response = await fetch(`${baseUrl}/v1/product/search?${query}`);
    expect(response.status).toBe(400);
    expect(findSpy).not.toHaveBeenCalled();
  });
});

describe("GET /v1/product/:id", () => {
  test("returns product details with categories, images, and options", async () => {
    const productData = {
      id: 1,
      enabled: true,
      name: "Sneaker",
      slug: "sneaker",
      stock: 5,
      description: "Lightweight shoe",
      price: 120,
      price_with_discount: 100,
      Categories: [{ id: 4 }],
      ProductImages: [{ id: 2, path: "media/products/sneaker.png" }],
      ProductOptions: [{ id: 3, title: "Size", values: "S,M" }],
    };
    jest.spyOn(Product, "findByPk").mockResolvedValue({
      get: () => productData,
    });

    const response = await fetch(`${baseUrl}/v1/product/1`);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: 1,
      enabled: true,
      name: "Sneaker",
      slug: "sneaker",
      stock: 5,
      description: "Lightweight shoe",
      price: 120,
      price_with_discount: 100,
      category_ids: [4],
      images: [
        { id: 2, content: `${baseUrl}/media/products/sneaker.png` },
      ],
      options: productData.ProductOptions,
    });
    expect(Product.findByPk).toHaveBeenCalledWith(
      "1",
      expect.objectContaining({
        include: expect.arrayContaining([
          expect.objectContaining({ as: "ProductImages" }),
          expect.objectContaining({ as: "ProductOptions" }),
          expect.objectContaining({ as: "Categories" }),
        ]),
      }),
    );
  });

  test("returns 404 when the product does not exist", async () => {
    jest.spyOn(Product, "findByPk").mockResolvedValue(null);

    const response = await fetch(`${baseUrl}/v1/product/999`);

    expect(response.status).toBe(404);
  });
});

describe("POST /v1/product", () => {
  const token = () =>
    jwt.sign({ sub: "test-user" }, process.env.JWT_SECRET);
  const validProduct = {
    enabled: true,
    name: "Product",
    slug: "product",
    stock: 10,
    description: "Test product",
    price: 119.9,
    price_with_discount: 99.9,
    category_ids: [4],
    images: [{ type: "image/png", content: "aGVsbG8=" }],
    options: [
      {
        title: "Size",
        shape: "square",
        radius: "4px",
        type: "text",
        value: ["S", "M"],
      },
    ],
  };

  test.each([
    ["missing", undefined],
    ["invalid", "Bearer invalid-token"],
  ])("returns 401 for a %s token", async (_case, authorization) => {
    const createSpy = jest.spyOn(Product, "create");
    const headers = { "Content-Type": "application/json" };
    if (authorization) headers.Authorization = authorization;

    const response = await fetch(`${baseUrl}/v1/product`, {
      method: "POST",
      headers,
      body: JSON.stringify(validProduct),
    });

    expect(response.status).toBe(401);
    expect(createSpy).not.toHaveBeenCalled();
  });

  test("creates the product and its related records", async () => {
    const transaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
    };
    jest.spyOn(sequelize, "transaction").mockResolvedValue(transaction);
    jest.spyOn(Category, "findAll").mockResolvedValue([{ id: 4 }]);
    jest.spyOn(Product, "create").mockResolvedValue({ id: 12 });
    const imageSpy = jest.spyOn(ProductImage, "create").mockResolvedValue({});
    const optionSpy = jest.spyOn(ProductOption, "create").mockResolvedValue({});
    const categorySpy = jest
      .spyOn(ProductCategory, "create")
      .mockResolvedValue({});
    jest.spyOn(fs, "mkdir").mockResolvedValue(undefined);
    const writeFileSpy = jest
      .spyOn(fs, "writeFile")
      .mockResolvedValue(undefined);

    const response = await fetch(`${baseUrl}/v1/product`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validProduct),
    });

    expect(response.status).toBe(201);
    expect(await response.text()).toBe("");
    expect(Product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Product",
        slug: "product",
        price: 119.9,
        price_with_discount: 99.9,
      }),
      { transaction },
    );
    expect(writeFileSpy).toHaveBeenCalledWith(
      expect.stringContaining("image-1.png"),
      Buffer.from("aGVsbG8=", "base64"),
    );
    expect(imageSpy).toHaveBeenCalledWith(
      { product_id: 12, path: "media/products/12/image-1.png" },
      { transaction },
    );
    expect(optionSpy).toHaveBeenCalledWith(
      {
        product_id: 12,
        title: "Size",
        shape: "square",
        radius: 4,
        type: "text",
        values: "S,M",
      },
      { transaction },
    );
    expect(categorySpy).toHaveBeenCalledWith(
      { product_id: 12, category_id: 4 },
      { transaction },
    );
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(transaction.rollback).not.toHaveBeenCalled();
  });

  test("returns 400 for invalid product data", async () => {
    const createSpy = jest.spyOn(Product, "create");

    const response = await fetch(`${baseUrl}/v1/product`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...validProduct, price: "119.90" }),
    });

    expect(response.status).toBe(400);
    expect(createSpy).not.toHaveBeenCalled();
  });
});

describe("PUT /v1/product/:id", () => {
  const authorization = () =>
    `Bearer ${jwt.sign({ sub: "test-user" }, process.env.JWT_SECRET)}`;
  const updatedProduct = {
    enabled: true,
    name: "Updated product",
    slug: "updated-product",
    stock: 20,
    description: "Updated description",
    price: 49.9,
    price_with_discount: 0,
    category_ids: [1, 2],
    images: [
      { type: "image/png", content: "aGVsbG8=" },
      { id: 2, deleted: true },
      { id: 3, type: "image/png", content: "aGVsbG8=" },
      { id: 1, content: "https://store.com/image.jpg" },
    ],
    options: [
      { id: 1, deleted: true },
      { id: 2, radius: "10px", value: ["42/43", "44/45"] },
      {
        title: "Type",
        shape: "square",
        type: "text",
        values: ["Cotton", "Polyester"],
      },
    ],
  };

  test.each([undefined, "Bearer invalid-token"])(
    "returns 401 without a valid token",
    async (token) => {
      const findSpy = jest.spyOn(Product, "findByPk");
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = token;

      const response = await fetch(`${baseUrl}/v1/product/12`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updatedProduct),
      });

      expect(response.status).toBe(401);
      expect(findSpy).not.toHaveBeenCalled();
    },
  );

  test("returns 404 when the product does not exist", async () => {
    jest.spyOn(Product, "findByPk").mockResolvedValue(null);

    const response = await fetch(`${baseUrl}/v1/product/12`, {
      method: "PUT",
      headers: {
        Authorization: authorization(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProduct),
    });

    expect(response.status).toBe(404);
  });

  test("returns 400 for invalid product data", async () => {
    const product = { id: 12, update: jest.fn() };
    jest.spyOn(Product, "findByPk").mockResolvedValue(product);

    const response = await fetch(`${baseUrl}/v1/product/12`, {
      method: "PUT",
      headers: {
        Authorization: authorization(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...updatedProduct, price: "49.90" }),
    });

    expect(response.status).toBe(400);
    expect(product.update).not.toHaveBeenCalled();
  });

  test("updates the product and its categories, images, and options", async () => {
    const transaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
    };
    const product = { id: 12, update: jest.fn().mockResolvedValue(undefined) };
    const imageRecords = [
      { id: 1, update: jest.fn().mockResolvedValue(undefined) },
      { id: 2, destroy: jest.fn().mockResolvedValue(undefined) },
      { id: 3, update: jest.fn().mockResolvedValue(undefined) },
    ];
    const optionRecords = [
      { id: 1, destroy: jest.fn().mockResolvedValue(undefined) },
      { id: 2, update: jest.fn().mockResolvedValue(undefined) },
    ];
    jest.spyOn(Product, "findByPk").mockResolvedValue(product);
    jest.spyOn(Category, "findAll").mockResolvedValue([{ id: 1 }, { id: 2 }]);
    jest.spyOn(ProductImage, "findAll").mockResolvedValue(imageRecords);
    jest.spyOn(ProductImage, "create").mockResolvedValue({
      id: 4,
      update: jest.fn().mockResolvedValue(undefined),
    });
    jest.spyOn(ProductOption, "findAll").mockResolvedValue(optionRecords);
    jest.spyOn(ProductOption, "create").mockResolvedValue({});
    jest.spyOn(ProductCategory, "destroy").mockResolvedValue(0);
    const categoryCreateSpy = jest
      .spyOn(ProductCategory, "bulkCreate")
      .mockResolvedValue([]);
    jest.spyOn(sequelize, "transaction").mockResolvedValue(transaction);
    jest.spyOn(fs, "mkdir").mockResolvedValue(undefined);
    const writeFileSpy = jest
      .spyOn(fs, "writeFile")
      .mockResolvedValue(undefined);

    const response = await fetch(`${baseUrl}/v1/product/12`, {
      method: "PUT",
      headers: {
        Authorization: authorization(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProduct),
    });

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
    expect(product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Updated product",
        price: 49.9,
        price_with_discount: 0,
      }),
      { transaction },
    );
    expect(imageRecords[1].destroy).toHaveBeenCalledWith({ transaction });
    expect(imageRecords[0].update).toHaveBeenCalledWith(
      { path: "https://store.com/image.jpg" },
      { transaction },
    );
    expect(imageRecords[2].update).toHaveBeenCalledWith(
      { path: expect.stringMatching(/^media\/products\/12\/image-/) },
      { transaction },
    );
    expect(writeFileSpy).toHaveBeenCalledWith(
      expect.stringMatching(/image-.*-3\.png$/),
      Buffer.from("aGVsbG8=", "base64"),
    );
    expect(writeFileSpy).toHaveBeenCalledWith(
      expect.stringMatching(/image-.*-1\.png$/),
      Buffer.from("aGVsbG8=", "base64"),
    );
    expect(optionRecords[0].destroy).toHaveBeenCalledWith({ transaction });
    expect(optionRecords[1].update).toHaveBeenCalledWith(
      { radius: 10, values: "42/43,44/45" },
      { transaction },
    );
    expect(ProductOption.create).toHaveBeenCalledWith(
      expect.objectContaining({
        product_id: 12,
        title: "Type",
        values: "Cotton,Polyester",
      }),
      { transaction },
    );
    expect(categoryCreateSpy).toHaveBeenCalledWith(
      [
        { product_id: 12, category_id: 1 },
        { product_id: 12, category_id: 2 },
      ],
      { transaction },
    );
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(transaction.rollback).not.toHaveBeenCalled();
  });
});

describe("DELETE /v1/product/:id", () => {
  const authorization = () =>
    `Bearer ${jwt.sign({ sub: "test-user" }, process.env.JWT_SECRET)}`;

  test.each([undefined, "Bearer invalid-token"])(
    "returns 401 without a valid token",
    async (token) => {
      const findSpy = jest.spyOn(Product, "findByPk");
      const headers = {};
      if (token) headers.Authorization = token;

      const response = await fetch(`${baseUrl}/v1/product/12`, {
        method: "DELETE",
        headers,
      });

      expect(response.status).toBe(401);
      expect(findSpy).not.toHaveBeenCalled();
    },
  );

  test("returns 404 when the product does not exist", async () => {
    jest.spyOn(Product, "findByPk").mockResolvedValue(null);

    const response = await fetch(`${baseUrl}/v1/product/12`, {
      method: "DELETE",
      headers: { Authorization: authorization() },
    });

    expect(response.status).toBe(404);
  });

  test("deletes the product and its related records", async () => {
    const transaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
    };
    const product = {
      id: 12,
      destroy: jest.fn().mockResolvedValue(undefined),
    };
    jest.spyOn(Product, "findByPk").mockResolvedValue(product);
    jest.spyOn(sequelize, "transaction").mockResolvedValue(transaction);
    const categoryDeleteSpy = jest
      .spyOn(ProductCategory, "destroy")
      .mockResolvedValue(1);
    const imageDeleteSpy = jest
      .spyOn(ProductImage, "destroy")
      .mockResolvedValue(1);
    const optionDeleteSpy = jest
      .spyOn(ProductOption, "destroy")
      .mockResolvedValue(1);

    const response = await fetch(`${baseUrl}/v1/product/12`, {
      method: "DELETE",
      headers: { Authorization: authorization() },
    });

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
    expect(categoryDeleteSpy).toHaveBeenCalledWith({
      where: { product_id: 12 },
      transaction,
    });
    expect(imageDeleteSpy).toHaveBeenCalledWith({
      where: { product_id: 12 },
      transaction,
    });
    expect(optionDeleteSpy).toHaveBeenCalledWith({
      where: { product_id: 12 },
      transaction,
    });
    expect(product.destroy).toHaveBeenCalledWith({ transaction });
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(transaction.rollback).not.toHaveBeenCalled();
  });
});
