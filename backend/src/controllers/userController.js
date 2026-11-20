const User = require("../models/User");

async function createUser(req, res) {
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

async function getUserById(req, res) {
  const user = await User.findByPk(req.params.id, {
    attributes: ["id", "firstname", "surname", "email"],
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json(user);
}

async function updateUser(req, res) {
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
}

module.exports = { createUser, getUserById, updateUser };
