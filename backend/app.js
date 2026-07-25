import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

// Config & middlewares
import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";
import { apiLimiter } from "./middleware/rateLimit.middleware.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import campaignRoutes from "./routes/campaign.routes.js";
import contentRoutes from "./routes/content.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import teamRoutes from "./routes/team.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Headers
app.use(helmet());

// CORS Policy
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Logging HTTP Requests
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Request parsers
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Global rate limiting
app.use("/api/", apiLimiter);

// Mounting Routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// Root path heartbeat check
app.get("/", (req, res) => {
  res.json({ status: "healthy", message: "Strategix AI API Server is live" });
});

// 404 Route Not Found
app.use(notFound);

// Global Error Catching Middleware
app.use(errorHandler);

export default app;
