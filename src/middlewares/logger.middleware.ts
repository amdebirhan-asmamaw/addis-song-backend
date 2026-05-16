// src/middlewares/logger.middleware.ts
import { Request, Response, NextFunction } from "express";

export const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  console.log("########################################################");
  console.log("----- Incoming Request -----");
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("IP:", req.ip);
  console.log("Query:", req.query);
  console.log("Body:", req.body);
  console.log("########################################################");

  next();
};
