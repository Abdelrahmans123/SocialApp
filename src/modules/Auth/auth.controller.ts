import express from "express";
import AuthService from "./auth.service";
import { validate } from "../../middleware/validation.middleware";
import { loginSchema, registerSchema } from "./auth.validation";
import { authenticate } from "../../middleware/authenticate.middleware";

const router = express.Router({
	caseSensitive: true,
	strict: true,
});
router.post("/register", validate(registerSchema), AuthService.register);
router.post("/login", validate(loginSchema), AuthService.login);
router.post("/logout", authenticate, AuthService.logout);
router.patch("/confirm-email", AuthService.confirmEmail);
router.post("/forgot-password", AuthService.forgotPassword);
router.patch("/reset-password", AuthService.resetPassword);

export default router;
