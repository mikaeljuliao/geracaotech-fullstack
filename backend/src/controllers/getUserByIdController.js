const User = require("../models/User");

async function getUserByIdController(req, res) {
  const user = await User.findByPk(req.params.id, {
    attributes: ["id", "firstname", "surname", "email"],
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json(user);
}

module.exports = getUserByIdController;
