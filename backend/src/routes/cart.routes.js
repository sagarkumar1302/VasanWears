import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
  updateCartItem,
} from "../controllers/cart.controllers.js";

import verifyJwt from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add", verifyJwt, addToCart);
router.get("/", verifyJwt, getCart);
router.delete("/remove/:itemId", verifyJwt, removeFromCart);
router.delete("/clear", verifyJwt, clearCart);
router.put("/update/:itemId", verifyJwt, updateCartItem);

export default router;
