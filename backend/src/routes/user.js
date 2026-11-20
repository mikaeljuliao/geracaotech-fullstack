const express = require("express");
const {
  createUser,
  getUserById,
  updateUser,
} = require("../controllers/userController");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

router.post("/", createUser);
router.get("/:id", getUserById);
router.put("/:id", authenticateToken, updateUser);

module.exports = router;
