import { Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { protect } from "../middlewares/auth.js";

const router = Router();

function generateToken(id, isAdmin) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return jwt.sign({ id, isAdmin }, secret, { expiresIn: "30d" });
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) { res.status(400).json({ message: "Name, email aur password required hai" }); return; }
    const exists = await User.findOne({ email });
    if (exists) { res.status(400).json({ message: "Yeh email already registered hai" }); return; }
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id.toString(), user.isAdmin);
    res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, phone: user.phone, avatar: user.avatar } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) { res.status(400).json({ message: "Email aur password required hai" }); return; }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) { res.status(401).json({ message: "Email ya password galat hai" }); return; }
    const token = generateToken(user._id.toString(), user.isAdmin);
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, phone: user.phone, avatar: user.avatar, address: user.address } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user?._id).select("-password");
    if (!user) { res.status(404).json({ message: "User nahi mila" }); return; }
    res.json({ user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/auth/profile
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) { res.status(404).json({ message: "User nahi mila" }); return; }
    const { name, email, phone, avatar, address } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (address) user.address = address;
    await user.save();
    res.json({ user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, phone: user.phone, avatar: user.avatar, address: user.address } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/auth/password
router.put("/password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);
    if (!user) { res.status(404).json({ message: "User nahi mila" }); return; }
    if (!(await user.comparePassword(currentPassword))) { res.status(400).json({ message: "Current password galat hai" }); return; }
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password change ho gaya" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
