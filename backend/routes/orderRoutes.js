const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderAnalytics,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Create order
router.post("/", authMiddleware, createOrder);

// Get logged-in user's orders
router.get("/my", authMiddleware, getMyOrders);

// Get all orders for admin
router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAllOrders
);

// Get analytics data for admin dashboard
router.get(
  "/admin/analytics",
  authMiddleware,
  adminMiddleware,
  getOrderAnalytics
);

// Update order status
router.patch(
  "/admin/:id/status",
  authMiddleware,
  adminMiddleware,
  updateOrderStatus
);

// Delete order
router.delete(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  deleteOrder
);

module.exports = router;