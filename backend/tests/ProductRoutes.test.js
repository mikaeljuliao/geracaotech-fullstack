process.env.DB_NAME = "test_db";
process.env.DB_USER = "test_user";

const { Op } = require("sequelize");
const app = require("../src/app");
const Product = require("../src/models/Product");
const ProductOption = require("../src/models/ProductOption");
const ProductCategory = require("../src/models/ProductCategory");

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
      ProductImages: [{ id: 2, path: "media/sneaker.png" }],
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
          images: [{ id: 2, content: "media/sneaker.png" }],
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
