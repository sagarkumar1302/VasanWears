import { Router } from "express";
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
  markCouponAsUsed,
  getActiveCoupons,
} from "../controllers/coupon.controllers.js";
import adminVerifyJwt from "../middleware/adminAuth.middleware.js";
import verifyJWT from "../middleware/auth.middleware.js";

const router = Router();

/* ================= ADMIN ROUTES ================= */

// CREATE COUPON
router.post("/", adminVerifyJwt, createCoupon);

// GET ALL COUPONS (with filters)
router.get("/admin/all", adminVerifyJwt, getAllCoupons);

// GET COUPON BY ID
router.get("/admin/:id", adminVerifyJwt, getCouponById);

// UPDATE COUPON
router.put("/:id", adminVerifyJwt, updateCoupon);

// DELETE COUPON
router.delete("/:id", adminVerifyJwt, deleteCoupon);

/* ================= USER ROUTES ================= */

// GET ACTIVE COUPONS (public or user)
router.get("/active", getActiveCoupons);

// VALIDATE COUPON (requires authentication to check per-user limits)
router.post("/validate", verifyJWT, validateCoupon);

// MARK COUPON AS USED (called after successful order)
router.post("/mark-used", verifyJWT, markCouponAsUsed);

export default router;
