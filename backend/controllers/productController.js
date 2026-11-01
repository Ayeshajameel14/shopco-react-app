const Product = require("../models/Product");

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ id: 1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products.",
    });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findOne({ id: productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product.",
    });
  }
};

// Add new product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      originalPrice,
      discount,
      rating,
      reviewsCount,
      category,
      style,
      colors,
      sizes,
      images,
      description,
    } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price and category are required.",
      });
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid price.",
      });
    }

    const lastProduct = await Product.findOne().sort({ id: -1 });
    const nextId = lastProduct ? lastProduct.id + 1 : 1;

    const product = await Product.create({
      id: nextId,
      name: name.trim(),
      price: numericPrice,
      originalPrice: originalPrice ?? null,
      discount: discount ?? null,
      rating: rating ?? 0,
      reviewsCount: reviewsCount ?? 0,
      category: category.trim(),
      style: style ?? "",
      colors: colors ?? [],
      sizes: sizes ?? [],
      images: images ?? [],
      description: description ?? "",
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully.",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add product.",
    });
  }
};

// Update existing product
const updateProduct = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const allowedFields = [
      "name",
      "price",
      "originalPrice",
      "discount",
      "rating",
      "reviewsCount",
      "category",
      "style",
      "colors",
      "sizes",
      "images",
      "description",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.price !== undefined) {
      updates.price = Number(updates.price);

      if (!Number.isFinite(updates.price) || updates.price < 0) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid price.",
        });
      }
    }

    if (updates.name !== undefined) {
      updates.name = updates.name.trim();
    }

    if (updates.category !== undefined) {
      updates.category = updates.category.trim();
    }

    const product = await Product.findOneAndUpdate(
      { id: productId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update product.",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
};