import express from "express";
import {
  createColor,
  getAllColors,
  updateColor,
  deleteColor,
  getAllColorsWebsite,
} from "../controllers/color.controllers.js";
import adminVerifyJwt from "../middleware/adminAuth.middleware.js";


const router = express.Router();

router.post("/", adminVerifyJwt, createColor);
router.get("/", adminVerifyJwt, getAllColors);
router.get("/webcolors", getAllColorsWebsite);
router.patch("/:colorId", adminVerifyJwt, updateColor);
router.delete("/:colorId", adminVerifyJwt, deleteColor);

export default router;
