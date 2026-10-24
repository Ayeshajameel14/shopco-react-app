
const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  updateAccount,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);

router.put("/update-account", authMiddleware, updateAccount);

module.exports = router;
