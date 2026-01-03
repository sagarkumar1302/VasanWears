import { Router } from "express";
import { createDesign, getAllDesigns, getDesignById, getDesignByUserId, getMyDesigns, toggleLikeDesign, updateDesignVisibility } from "../controllers/design.controllers.js";
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
router.post("/:id", verifyJwt, getDesignById);
router.post("/user/:userId", verifyJwt, getDesignByUserId);
router.put("/:id/visibility", verifyJwt, updateDesignVisibility);

export default router;
