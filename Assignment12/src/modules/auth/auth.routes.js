import { Router } from "express";
import { register, login, profile, refreshToken, socialLogin, confirmEmail, resendOtp, logout, logoutFromAllDevices } from "./auth.controller.js";
import validation from "../../middleware/validation.middleware.js";
import auth from "../../middleware/auth.middleware.js";
import { registerSchema } from "./auth.validation.js";


const router = Router();

router.post("/register", validation(registerSchema), register);
router.post("/login", login);
router.post("/social-login", socialLogin);
router.get("/profile", auth, profile);
router.post("/logout", auth, logout)
router.post("/logout-from-all-devices", auth, logoutFromAllDevices);

router.post("/refresh-token", refreshToken);
router.patch("/confirm-email", confirmEmail)
router.post("/resend-otp", resendOtp);





export default router;