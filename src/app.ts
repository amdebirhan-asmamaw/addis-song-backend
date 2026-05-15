import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";

import { corsOptions } from "./config/corsOptions";
import { errorHandler } from "./middlewares/error.middleware";
import routes from "./index.routes";
const app = express();

const API_PREFIX = "/api/v1";

// Security headers
app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

// Middleware
app.use(corsOptions);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use(API_PREFIX, routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use(errorHandler);

export default app;
