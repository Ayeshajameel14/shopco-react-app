
const Cart = require("../models/Cart");

async function getCart(req, res) {
  try {
    const cart = await Cart.findOne({ user: req.userId });

    res.json({
      success: true,
      items: cart ? cart.items : [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load cart.",
    });
  }
}

async function saveCart(req, res) {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Cart items must be an array.",
      });
    }

    const safeItems = items.map((item) => ({
      productId: Number(item.productId),
      name: String(item.name || ""),
      price: Number(item.price),
      image: String(item.image || ""),
      size: String(item.size || ""),
      color: String(item.color || ""),
      quantity: Number(item.quantity),
    }));

    const invalidItem = safeItems.some(
      (item) =>
        !Number.isFinite(item.productId) ||
        !item.name ||
        !Number.isFinite(item.price) ||
        item.price < 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
    );

    if (invalidItem) {
      return res.status(400).json({
        success: false,
        message: "One or more cart items are invalid.",
      });
    }

    const cart = await Cart.findOneAndUpdate(
      { user: req.userId },
      { $set: { items: safeItems } },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Cart saved successfully.",
      items: cart.items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to save cart.",
    });
  }
}

module.exports = { getCart, saveCart };
