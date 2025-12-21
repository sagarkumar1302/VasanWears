// routes/subcategory.routes.js
import { Router } from "express";
import adminVerifyJwt from "../middleware/adminAuth.middleware.js";
import { createSubCategory, deleteSubCategory, updateSubCategory } from "../controllers/subcategory.controllers.js";


const router = Router();

// CREATE SUBCATEGORY
// now accepts categoryId as a URL param: POST /api/admin/subcategories/:categoryId
router.post("/:categoryId", adminVerifyJwt, createSubCategory);

// UPDATE SUBCATEGORY
router.put("/:id", adminVerifyJwt, updateSubCategory);

// DELETE SUBCATEGORY
router.delete("/:id", adminVerifyJwt, deleteSubCategory);

export default router;
