import { Router } from "express";
import verifyJwt from "../middleware/auth.middleware.js";
import { getMessageForSelectedUser, getUserForSidebar, markMessageSeen, sendMessage } from "../controllers/message.controllers.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router();
router.route("/get-all-users").get(verifyJwt, getUserForSidebar)
router.route("/get-message/:id").get(verifyJwt, getMessageForSelectedUser)
router.route("/mark-as-seen/:id").put(verifyJwt, markMessageSeen)
router.route("/send-message/:id").post(upload.single("image"), verifyJwt, sendMessage)

export default router