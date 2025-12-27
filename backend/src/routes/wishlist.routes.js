import express from "express";
import {
  toggleWishlist,
  getWishlist,
} from "../controllers/wishlist.controllers.js";
import verifyJwt from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/toggle", verifyJwt, toggleWishlist);
router.get("/", verifyJwt, getWishlist);

export default router;
