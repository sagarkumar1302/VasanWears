import express from "express";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
} from "../controllers/order.controllers.js";
import verifyJwt from "../middleware/auth.middleware.js";
import adminVerifyJwt from "../middleware/adminAuth.middleware.js";
const router = express.Router();

router.post("/place", verifyJwt, placeOrder);
router.get("/my-orders", verifyJwt, getMyOrders);
router.get("/:id", verifyJwt, getOrderById);
router.get("/admin/:id", adminVerifyJwt, getOrderById);
router.get("/admin", adminVerifyJwt, getAllOrders);

export default router;
