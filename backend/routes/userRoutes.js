
const express = require("express");
const router = express.Router();

const { getAllCustomers } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAllCustomers
);

module.exports = router;
