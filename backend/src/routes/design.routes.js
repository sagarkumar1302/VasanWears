import { Router } from "express";
import { createDesign, getAllDesigns, getDesignById, getDesignByUserId, getMyDesigns, toggleLikeDesign, updateDesign } from "../controllers/design.controllers.js";
import verifyJwt from "../middleware/auth.middleware.js";

const router = Router();

/**
 * PUBLIC
 */
router.get("/", getAllDesigns);

/**
 * USER
 */
router.post("/", verifyJwt, createDesign);
router.get("/me", verifyJwt, getMyDesigns);
router.post("/:id/like", verifyJwt, toggleLikeDesign);
router.get("/:id", verifyJwt, getDesignById);
router.get("/user/:userId", verifyJwt, getDesignByUserId);
router.put("/:id", verifyJwt, updateDesign);

export default router;
