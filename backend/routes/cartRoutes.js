
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getCart, saveCart } = require("../controllers/cartController");

router.get("/", authMiddleware, getCart);
router.put("/", authMiddleware, saveCart);

module.exports = router;
