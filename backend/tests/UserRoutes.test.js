process.env.DB_NAME = "test_db";
process.env.DB_USER = "test_user";

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
