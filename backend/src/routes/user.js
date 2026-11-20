const express = require("express");
const createUserController = require("../controllers/createUserController");
const deleteUserController = require("../controllers/deleteUserController");
const getUserByIdController = require("../controllers/getUserByIdController");
const updateUserController = require("../controllers/updateUserController");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

router.post("/", createUserController);
router.get("/:id", getUserByIdController);
router.put("/:id", authenticateToken, updateUserController);
router.delete("/:id", authenticateToken, deleteUserController);

module.exports = router;
