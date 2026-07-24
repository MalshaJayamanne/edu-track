import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (error) {
    res.status(401).json({ message: "Token failed" });
  }
};

export const checkAICredits = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentCredits = user.aiCredits !== undefined ? user.aiCredits : 20;

    if (currentCredits <= 0) {
      return res.status(403).json({
        message: "Your AI credits have finished. Please top up or reset your credits in Settings.",
        isCreditError: true
      });
    }

    user.aiCredits = currentCredits - 1;
    await user.save();

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};