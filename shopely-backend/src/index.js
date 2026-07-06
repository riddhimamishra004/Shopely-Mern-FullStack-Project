import "dotenv/config";
import app from "./app.js";
import { logger } from "./lib/logger.js";
import { connectDB } from "./lib/db.js";

const port = Number(process.env.PORT ?? 5000);

connectDB().then(() => {
  app.listen(port, (err) => {
    if (err) { logger.error({ err }, "Error listening on port"); process.exit(1); }
    logger.info({ port }, "Server listening on port " + port);
  });
});
