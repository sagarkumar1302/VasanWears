import express from "express";
import {
  createSize,
  getAllSizes,
  updateSize,
  deleteSize,
} from "../controllers/size.controllers.js";
import adminVerifyJwt from "../middleware/adminAuth.middleware.js";

const router = express.Router();

router.post("/", adminVerifyJwt, createSize);
router.get("/", adminVerifyJwt, getAllSizes);
router.patch("/:sizeId", adminVerifyJwt, updateSize);
router.delete("/:sizeId", adminVerifyJwt, deleteSize);

export default router;
