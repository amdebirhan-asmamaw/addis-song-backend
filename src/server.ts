import app from "./app";
import { env } from "./config/env";
import { createServer } from "http";
import { connectMongo, closeMongoConnection } from "./config/db";

async function startServer() {
  try {
    // Connect DB
    await connectMongo();

    // Create HTTP server
    const server = createServer(app);

    server.listen(env.port, () => {
      console.log(`Server running on port: ${env.port}`);
    });

    // Graceful shutdown (minimal version)
    const shutdown = async () => {
      console.log("Shutting down server...");

      await closeMongoConnection();
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
