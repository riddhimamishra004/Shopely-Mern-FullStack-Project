import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export async function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Not authorized, no token" }); return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) { res.status(500).json({ message: "Server configuration error" }); return; }
    const decoded = jwt.verify(token, secret);
    req.user = { _id: decoded.id, isAdmin: decoded.isAdmin };
    next();
  } catch {
    res.status(401).json({ message: "Token invalid or expired" });
  }
}

export function adminOnly(req, res, next) {
  if (!req.user?.isAdmin) { res.status(403).json({ message: "Admin access required" }); return; }
  next();
}
