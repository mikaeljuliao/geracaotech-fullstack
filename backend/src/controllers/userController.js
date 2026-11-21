const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const userController = {
  // GET /v1/user/:id
  async getById(req, res) {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "firstname", "surname", "email"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  },

  // POST /v1/user
  async create(req, res) {
    const {
      firstname,
      surname,
      email,
      password,
      confirmPassword,
    } = req.body || {};

    if (
      !firstname ||
      !surname ||
      !email ||
      !password ||
      !confirmPassword ||
      password !== confirmPassword
    ) {
      return res.status(400).json({ message: "Invalid user data" });
    }

    await User.create({
      firstname,
      surname,
      email,
      password,
    });

    return res.status(201).send();
  },

  // POST /v1/user/token
  async generateToken(req, res) {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || !email || typeof password !== "string" || !password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "JWT_SECRET is not configured" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ sub: String(user.id) }, secret);
    return res.status(200).json({ token });
  },

  // PUT /v1/user/:id
  async update(req, res) {
    const { firstname, surname, email } = req.body || {};

    if (!firstname || !surname || !email) {
      return res.status(400).json({ message: "Invalid user data" });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({ firstname, surname, email });

    return res.status(204).send();
  },

  // DELETE /v1/user/:id
  async delete(req, res) {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();

    return res.status(204).send();
  },
};

module.exports = userController;
