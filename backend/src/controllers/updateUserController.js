const User = require("../models/User");

async function updateUserController(req, res) {
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

module.exports = updateUserController;
