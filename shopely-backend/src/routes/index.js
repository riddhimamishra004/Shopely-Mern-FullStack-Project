import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import productsRouter from "./products.js";
import categoriesRouter from "./categories.js";
import ordersRouter from "./orders.js";
import usersRouter from "./users.js";
import adminRouter from "./admin.js";
import seedRouter from "./seed.js";
import couponsRouter from "./coupons.js";

const router = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/orders", ordersRouter);
router.use("/users", usersRouter);
router.use("/admin", adminRouter);
router.use("/seed", seedRouter);
router.use("/coupons", couponsRouter);

export default router;
