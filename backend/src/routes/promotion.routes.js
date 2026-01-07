import { Router } from "express";
import {
  createPromotion,
  getAllPromotions,
  getPromotionById,
  checkApplicablePromotions,
  calculatePromotionBenefit,
  updatePromotion,
  deletePromotion,
  getActivePromotions,
} from "../controllers/promotion.controllers.js";
import adminVerifyJwt from "../middleware/adminAuth.middleware.js";

const router = Router();

/* ================= ADMIN ROUTES ================= */

// CREATE PROMOTION
router.post("/", adminVerifyJwt, createPromotion);

// GET ALL PROMOTIONS (with filters)
router.get("/admin/all", adminVerifyJwt, getAllPromotions);

// GET PROMOTION BY ID
router.get("/admin/:id", adminVerifyJwt, getPromotionById);

// UPDATE PROMOTION
router.put("/:id", adminVerifyJwt, updatePromotion);

// DELETE PROMOTION
router.delete("/:id", adminVerifyJwt, deletePromotion);

/* ================= USER ROUTES ================= */

// GET ACTIVE PROMOTIONS (public)
router.get("/active", getActivePromotions);

// CHECK APPLICABLE PROMOTIONS FOR CART
router.post("/check-applicable", checkApplicablePromotions);

// CALCULATE PROMOTION BENEFIT
router.post("/calculate-benefit", calculatePromotionBenefit);

export default router;
