const Order = require("../models/Order");
const Cart = require("../models/Cart");

// Create a new order
const createOrder = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      city,
      postalCode,
      paymentMethod,
    } = req.body;

    if (!fullName || !email || !phone || !address || !city) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required checkout fields.",
      });
    }

    if (paymentMethod && paymentMethod !== "COD") {
      return res.status(400).json({
        success: false,
        message: "Only Cash on Delivery is available.",
      });
    }

    const cart = await Cart.findOne({ user: req.userId });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    const items = cart.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image || "",
      size: item.size || "",
      color: item.color || "",
      quantity: item.quantity,
    }));

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const discount = Math.round(subtotal * 0.2 * 100) / 100;
    const deliveryFee = subtotal > 0 ? 15 : 0;

    const total =
      Math.round((subtotal - discount + deliveryFee) * 100) / 100;

    const order = await Order.create({
      user: req.userId,
      items,
      shippingAddress: {
        fullName,
        email,
        phone,
        address,
        city,
        postalCode: postalCode || "",
      },
      paymentMethod: "COD",
      subtotal,
      discount,
      deliveryFee,
      total,
    });

    await Cart.findOneAndUpdate(
      { user: req.userId },
      { $set: { items: [] } }
    );

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to place your order. Please try again.",
    });
  }
};

// Get logged-in user's orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load your orders.",
    });
  }
};

// Get all orders for admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load all orders.",
    });
  }
};

// Get real analytics for admin dashboard
const getOrderAnalytics = async (req, res) => {
  try {
    const now = new Date();

    // Include current month and previous five months
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - 5,
      1
    );

    // Monthly order counts and delivered revenue
    const monthlyData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalOrders: { $sum: 1 },
          deliveredOrders: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Delivered"] },
                1,
                0,
              ],
            },
          },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Delivered"] },
                "$total",
                0,
              ],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // All-time order status counts
    const statusData = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Best-selling products from delivered orders
    const bestSellingProducts = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          quantitySold: { $sum: "$items.quantity" },
          sales: {
            $sum: {
              $multiply: [
                "$items.price",
                "$items.quantity",
              ],
            },
          },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          name: "$_id",
          quantitySold: 1,
          sales: 1,
        },
      },
    ]);

    // All-time summary
    const summaryResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          deliveredOrders: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Delivered"] },
                1,
                0,
              ],
            },
          },
          pendingOrders: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Pending"] },
                1,
                0,
              ],
            },
          },
          cancelledOrders: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Cancelled"] },
                1,
                0,
              ],
            },
          },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Delivered"] },
                "$total",
                0,
              ],
            },
          },
        },
      },
    ]);

    const summary = summaryResult[0] || {
      totalOrders: 0,
      deliveredOrders: 0,
      pendingOrders: 0,
      cancelledOrders: 0,
      revenue: 0,
    };

    // Always return six months, including months with no orders
    const revenueByMonth = Array.from(
      { length: 6 },
      (_, index) => {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() - 5 + index,
          1
        );

        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const record = monthlyData.find(
          (item) =>
            item._id.year === year &&
            item._id.month === month
        );

        return {
          month: date.toLocaleString("en-US", {
            month: "short",
          }),
          year,
          orders: record?.totalOrders || 0,
          deliveredOrders: record?.deliveredOrders || 0,
          revenue: record?.revenue || 0,
        };
      }
    );

    const orderStatuses = [
      "Pending",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled",
    ].map((status) => ({
      status,
      count:
        statusData.find((item) => item._id === status)
          ?.count || 0,
    }));

    return res.status(200).json({
      success: true,
      summary: {
        totalOrders: summary.totalOrders,
        deliveredOrders: summary.deliveredOrders,
        pendingOrders: summary.pendingOrders,
        cancelledOrders: summary.cancelledOrders,
        revenue: summary.revenue,
      },
      revenueByMonth,
      orderStatuses,
      bestSellingProducts,
    });
  } catch (error) {
    console.error("Get order analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load analytics.",
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after", runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update order status.",
    });
  }
};

// Permanently delete one order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    await order.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully.",
    });
  } catch (error) {
    console.error("Delete order error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete order.",
    });
  }
};

// Export controller functions
module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderAnalytics,
  updateOrderStatus,
  deleteOrder,
};
