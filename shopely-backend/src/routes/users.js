import { Router } from "express";
import { User } from "../models/User.js";
import { protect, adminOnly } from "../middlewares/auth.js";

const router = Router();

router.get("/", protect, adminOnly, async (_req, res) => {
  try { res.json(await User.find().select("-password").sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id/role", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isAdmin: req.body.isAdmin }, { new: true }).select("-password");
    if (!user) { res.status(404).json({ message: "User nahi mila" }); return; }
    res.json(user);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) { res.status(404).json({ message: "User nahi mila" }); return; }
    res.json({ message: "User delete ho gaya" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
