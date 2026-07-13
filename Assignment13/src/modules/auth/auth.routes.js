import { Router } from "express";
import { register, login, profile, refreshToken, socialLogin, confirmEmail, resendOtp, logout, logoutFromAllDevices, forgetPassword, resetPassword, updatePassword, updateEmail, confirmUpdateEmail } from "./auth.controller.js";
import validation from "../../middleware/validation.middleware.js";
import auth from "../../middleware/auth.middleware.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { loginRateLimit } from "../../middleware/rateLimit.middleware.js";


const router = Router();

router.post("/register", validation(registerSchema), register);
router.post("/login", loginRateLimit, validation(loginSchema), login);
router.post("/forget-password", forgetPassword);
router.patch("/reset-password", resetPassword);
router.patch("/update-password", auth, updatePassword);
router.patch("/update-email", auth, updateEmail);
router.patch("/confirm-update-email", auth, confirmUpdateEmail);

router.post("/social-login", socialLogin);
router.get("/profile", auth, profile);
router.post("/logout", auth, logout)
router.post("/logout-from-all-devices", auth, logoutFromAllDevices);

router.post("/refresh-token", refreshToken);
router.patch("/confirm-email", confirmEmail)
router.post("/resend-otp", resendOtp);





export default router;