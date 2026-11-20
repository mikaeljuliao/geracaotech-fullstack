const express = require("express");
const createUserController = require("../controllers/createUserController");
const getUserByIdController = require("../controllers/getUserByIdController");
const updateUserController = require("../controllers/updateUserController");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

router.post("/", createUserController);
router.get("/:id", getUserByIdController);
router.put("/:id", authenticateToken, updateUserController);

module.exports = router;
