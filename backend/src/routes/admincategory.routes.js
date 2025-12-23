import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getAllCategoriesWithSub,
  updateCategory,
} from "../controllers/category.controllers.js";
import adminVerifyJwt from "../middleware/adminAuth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();
router.get("/", adminVerifyJwt, getAllCategories);
// CREATE CATEGORY (WITH IMAGE)
router.post(
  "/",
  adminVerifyJwt,
  upload.single("image"), // 👈 THIS LINE
  createCategory
);

// UPDATE CATEGORY
router.put(
  "/:id",
  adminVerifyJwt,
  upload.single("image"),
  updateCategory
);
router.get("/catws",adminVerifyJwt, getAllCategoriesWithSub);
router.get("/",adminVerifyJwt, getAllCategories);

// DELETE CATEGORY
router.delete("/:id", adminVerifyJwt, deleteCategory);

export default router;
