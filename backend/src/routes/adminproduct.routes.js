import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import adminVerifyJwt from "../middleware/adminAuth.middleware.js";
import { createProduct, deleteProduct, getAllProducts, updateProduct } from "../controllers/product.controllers.js";
const router = Router();
router.post("/", adminVerifyJwt, createProduct);
router.get("/", getAllProducts);
router.put("/:id", adminVerifyJwt, updateProduct);
router.delete("/:id", adminVerifyJwt, deleteProduct);
export default router


// GET /api/products?category=123
// GET /api/products?minPrice=500&maxPrice=2000
// GET /api/products?color=Black&size=M
// GET /api/products?search=shirt&page=1&limit=12
