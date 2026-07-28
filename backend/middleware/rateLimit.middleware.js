import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "development" || req.ip === "127.0.0.1" || req.ip === "::1" || req.ip === "::ffff:127.0.0.1",
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
    errors: [],
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit login and register requests
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "development" || req.ip === "127.0.0.1" || req.ip === "::1" || req.ip === "::ffff:127.0.0.1",
  message: {
    success: false,
    message: "Too many authentication attempts, please try again after 15 minutes",
    errors: [],
  },
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit AI generation requests to 30 per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "AI quota exceeded for this hour, please try again later",
    errors: [],
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit file uploads
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many file upload attempts, please try again after 15 minutes",
    errors: [],
  },
});
