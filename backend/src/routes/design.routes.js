import { Router } from "express";
import { createDesign, getAllDesigns, getMyDesigns, toggleLikeDesign, updateDesignVisibility } from "../controllers/design.controllers.js";
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
router.put("/:id/visibility", verifyJwt, updateDesignVisibility);

export default router;
