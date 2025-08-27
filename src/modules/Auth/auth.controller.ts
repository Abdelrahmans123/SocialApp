import express from "express";
import AuthService from "./auth.service";
import { validate } from "../../middleware/validation.middleware";
import { loginSchema, registerSchema } from "./auth.validation";

const router = express.Router({
	caseSensitive: true,
	strict: true,
});
router.post("/register", validate(registerSchema), AuthService.register);
router.post("/login", validate(loginSchema), AuthService.login);
router.patch("/confirm-email", AuthService.confirmEmail);

export default router;
