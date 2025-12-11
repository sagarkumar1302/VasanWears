import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { currentUser, googleLogin, loginUser, registerUser, userProfile } from "../controllers/user.controllers.js";
import verifyJwt from "../middleware/auth.middleware.js";
const router = Router();
router.route("/register").post(upload.single("avatar"), registerUser)
router.route("/login").post(loginUser)
router.post("/google-login", googleLogin);
router.route("/current-user").get(verifyJwt, currentUser)
router.route("/user-profile/:id").get(verifyJwt, userProfile)
export default router