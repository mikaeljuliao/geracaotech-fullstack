const User = require("../models/User");

async function createUserController(req, res) {
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
}

module.exports = createUserController;
