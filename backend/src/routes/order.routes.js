import express from "express";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrder,
} from "../controllers/order.controllers.js";
import verifyJwt from "../middleware/auth.middleware.js";
import adminVerifyJwt from "../middleware/adminAuth.middleware.js";
const router = express.Router();

router.post("/place", verifyJwt, placeOrder);
router.get("/my-orders", verifyJwt, getMyOrders);
router.get("/admin", adminVerifyJwt, getAllOrders);
router.get("/admin/:id", adminVerifyJwt, getOrderById);
router.put("/admin/:id", adminVerifyJwt, updateOrder);
router.get("/:id", verifyJwt, getOrderById);
export default router;
