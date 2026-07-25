import User from "../models/user.model.js";
import { verifyAccessToken } from "../utils/jwtHelper.js";
import ApiError from "../utils/apiError.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError("Not authorized to access this resource", 401));
  }

  try {
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return next(new ApiError("Token expired or invalid", 401));
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new ApiError("User not found", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError("Not authorized to access this resource", 401));
  }
};
