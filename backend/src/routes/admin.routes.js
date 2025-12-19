import { Router } from "express";

import { adminLoginUser, currentUser, logoutHandler, refreshAccessToken } from "../controllers/admin.controllers.js";
import adminVerifyJwt from "../middleware/adminAuth.middleware.js";
const router = Router();
router.route("/admin-login").post(adminLoginUser)
router.route("/logout").post(adminVerifyJwt, logoutHandler);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/current-user").get(adminVerifyJwt, currentUser)
export default router