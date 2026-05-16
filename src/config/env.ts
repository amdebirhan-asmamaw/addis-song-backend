import "dotenv/config";
import Joi from "joi";

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(5000),
  MONGO_URI: Joi.string().required().messages({
    "string.empty": "MONGO_URI is required",
    "any.required": "MONGO_URI is required",
  }),
  CORS_ORIGINS: Joi.string().optional().allow(""),
  CORS_ORIGIN: Joi.string().optional().allow(""),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
  CLOUDINARY_URL: Joi.string().optional().allow(""),
}).unknown(true);

const { error, value: parsed } = envSchema.validate(process.env, {
  abortEarly: false,
  stripUnknown: false,
});

if (error) {
  console.error("❌ Environment validation failed:");
  error.details.forEach((d) => console.error(`   - ${d.message}`));
  process.exit(1);
}

export const env = {
  nodeEnv: parsed.NODE_ENV as string,
  isProd: parsed.NODE_ENV === "production",
  port: parsed.PORT as number,
  mongoUri: parsed.MONGO_URI as string,

  corsOrigins: (() => {
    const origins = parsed.CORS_ORIGINS || parsed.CORS_ORIGIN;
    if (!origins) return [];
    return origins
      .split(",")
      .map((o: string) => o.trim().toLowerCase().replace(/\/$/, ""))
      .filter(Boolean);
  })(),

  cloudinary: {
    cloudName: parsed.CLOUDINARY_CLOUD_NAME as string,
    apiKey: parsed.CLOUDINARY_API_KEY as string,
    apiSecret: parsed.CLOUDINARY_API_SECRET as string,
  },
};
