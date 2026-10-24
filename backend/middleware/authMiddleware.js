
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Please log in first.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
}
exports.updateAccount = async (req, res) => {
  try {
    const {
      email,
      currentPassword,
      newPassword,
      confirmNewPassword,
    } = req.body;

    if (!email || !currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and current password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (newPassword || confirmNewPassword) {
      if (!newPassword || !confirmNewPassword) {
        return res.status(400).json({
          success: false,
          message: "Enter and confirm your new password.",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 8 characters.",
        });
      }

      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({
          success: false,
          message: "New passwords do not match.",
        });
      }
    }

    const user = await User.findById(req.userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    user.email = normalizedEmail;

    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 12);
    }

    await user.save();

    return res.json({
      success: true,
      message: "Account updated successfully. Please log in again.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Account update error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update account.",
    });
  }
};
module.exports = authMiddleware;
