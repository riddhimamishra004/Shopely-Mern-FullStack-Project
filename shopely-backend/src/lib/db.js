import mongoose from "mongoose";
import { logger } from "./logger.js";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    logger.warn("MONGODB_URI not set — .env file check karo");
    return;
  }
  try {
    await mongoose.connect(uri);
    isConnected = true;
    logger.info("MongoDB connected successfully");
  } catch (err) {
    logger.error({ err }, "MongoDB connection failed");
    process.exit(1);
  }
}
