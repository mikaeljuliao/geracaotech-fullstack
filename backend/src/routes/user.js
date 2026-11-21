const express = require("express");
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

router.post("/", userController.create);
router.post("/token", userController.generateToken);
router.get("/:id", userController.getById);
router.put("/:id", authenticateToken, userController.update);
router.delete("/:id", authenticateToken, userController.delete);

module.exports = router;
