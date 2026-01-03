// routes/subcategory.routes.js
import { Router } from "express";
import adminVerifyJwt from "../middleware/adminAuth.middleware.js";
import { createSubCategory, deleteSubCategory, findSubCategoryById, getAllSubCategories, updateSubCategory } from "../controllers/subcategory.controllers.js";

import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// CREATE SUBCATEGORY
// now accepts categoryId as a URL param: POST /api/admin/subcategories/:categoryId
router.post("/:categoryId", upload.single("image"), adminVerifyJwt, createSubCategory);

// UPDATE SUBCATEGORY
router.put("/:id", upload.single("image"), adminVerifyJwt, updateSubCategory);

// DELETE SUBCATEGORY
router.delete("/:id", adminVerifyJwt, deleteSubCategory);
router.get("/:id", findSubCategoryById);
router.get("/", getAllSubCategories);

export default router;
