
require("dotenv").config();

const path = require("path");
const { pathToFileURL } = require("url");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const Product = require("./models/Product");

async function seedProducts() {
  try {
    await connectDB();

    const productsPath = path.resolve(
      __dirname,
      "../src/data/products.js"
    );

    const moduleUrl = pathToFileURL(productsPath).href;
    const { products } = await import(moduleUrl);

    if (!Array.isArray(products) || products.length === 0) {
      throw new Error("No products found in frontend data file");
    }

    const operations = products.map((product) => ({
      updateOne: {
        filter: { id: product.id },
        update: { $set: product },
        upsert: true,
      },
    }));

    const result = await Product.bulkWrite(operations);

    console.log(`Products found: ${products.length}`);
    console.log(`Inserted: ${result.upsertedCount}`);
    console.log(`Updated: ${result.modifiedCount}`);

    console.log("Products imported successfully!");
  } catch (error) {
    console.error("Product import failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();
