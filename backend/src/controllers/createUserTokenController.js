const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function createUserTokenController(req, res) {
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
}

module.exports = createUserTokenController;
