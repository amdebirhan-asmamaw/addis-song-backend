import "dotenv/config";

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT ?? 5000),

  // Database
  mongoUri: process.env.MONGO_URI as string,

  // CORS
  corsOrigins: (() => {
    const origins = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN;
    if (!origins) return [];
    return origins
      .split(",")
      .map((o) => o.trim().toLowerCase().replace(/\/$/, ""))
      .filter(Boolean);
  })(),
};
