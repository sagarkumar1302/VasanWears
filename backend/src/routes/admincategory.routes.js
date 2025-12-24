import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getAllCategoriesWithSub,
  getAllCategoriesWithSubWebsite,
  updateCategory,
} from "../controllers/category.controllers.js";
import adminVerifyJwt from "../middleware/adminAuth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

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
router.get("/catws", adminVerifyJwt, getAllCategoriesWithSub);
router.get("/catwsforweb", getAllCategoriesWithSubWebsite);

// DELETE CATEGORY
router.delete("/:id", adminVerifyJwt, deleteCategory);
//WEBSITE ONLY NO AUTH
router.get("/", getAllCategories);
export default router;
