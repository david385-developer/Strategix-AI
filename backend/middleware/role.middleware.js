import ApiError from "../utils/apiError.js";

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError("Not authorized, no user context", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          `User role '${req.user.role}' is not authorized to access this resource`,
          403
        )
      );
    }
    next();
  };
};
