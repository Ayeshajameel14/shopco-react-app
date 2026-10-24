
const StoreSettings = require("../models/StoreSettings");

// Get store settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await StoreSettings.create({
        storeName: "ShopCo",
        currency: "PKR",
        emailNotifications: true,
        updatedBy: req.userId,
      });
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get settings error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch store settings",
    });
  }
};

// Update store settings
exports.updateSettings = async (req, res) => {
  try {
    const { storeName, currency, emailNotifications } = req.body;

    if (!storeName || !storeName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Store name is required",
      });
    }

    if (!["PKR", "USD"].includes(currency)) {
      return res.status(400).json({
        success: false,
        message: "Invalid currency",
      });
    }

    if (typeof emailNotifications !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Email notifications must be true or false",
      });
    }

    const settings = await StoreSettings.findOneAndUpdate(
      {},
      {
        storeName: storeName.trim(),
        currency,
        emailNotifications,
        updatedBy: req.userId,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Settings saved successfully",
      settings,
    });
  } catch (error) {
    console.error("Update settings error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to save settings",
    });
  }
};
