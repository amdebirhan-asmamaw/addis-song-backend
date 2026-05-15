import cors from "cors";
import { env } from "./env";

export const corsOptions = cors({
  origin: env.corsOrigins.length > 0 ? env.corsOrigins : "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
});
