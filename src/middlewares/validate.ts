import type { NextFunction, Request, Response } from "express";
import type { ObjectSchema } from "joi";
import { apiResponse } from "../utils/apiResponse";

export const validate =
  (schema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      res.status(400).json(
        apiResponse({
          success: false,
          message: "Validation failed",
          error: error.details.map((d) =>
            `${d.path.join(".") || "body"}: ${d.message.replace(/["]/g, "")}`,
          ),
        }),
      );
      return;
    }
    req.body = value;
    next();
  };
