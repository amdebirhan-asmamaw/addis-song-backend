import type { NextFunction, Request, Response } from "express";
import { apiResponse } from "../utils/apiResponse";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === "production";

  const message =
    isProd && status === 500
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  // Build error details
  let error: string | string[] | undefined;

  if (err.isJoi && err.details) {
    error = err.details.map((d: any) =>
      `${d.path?.join(".") || "field"}: ${d.message.replace(/['"]/g, "")}`,
    );
  } else if (err?.code === 11000 && err?.keyValue) {
    error = Object.keys(err.keyValue).map((k) => `${k} already in use`);
  } else if (!isProd && err.stack) {
    error = err.stack;
  }

  console.error("Error:", {
    status,
    message: err.message,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(status).json(apiResponse({ success: false, message, error }));
}
