import { Router } from "express";
import * as userController from "./user.service";
import { authenticate } from "../../middleware/authenticate.middleware";
import { validate } from "../../middleware/validation.middleware";
import {
	getProfileSchema,
	updateImageSchema,
	searchUserSchema,
	updateUserSchema,
	restoreUserAccountSchema,
	freezeAccountSchema,
	restoreAccountSchema,
	hardDeleteSchema,
} from "./user.validation";

const router = Router();

// User Profile endpoints
router.get(
	"/profile/:id",
	validate(getProfileSchema),
	authenticate,
	userController.getProfile
);

router.patch(
	"/image",
	validate(updateImageSchema),
	authenticate,
	userController.updateImage
);

router.get(
	"/search",
	validate(searchUserSchema),
	authenticate,
	userController.searchUser
);

router.patch(
	"/update",
	validate(updateUserSchema),
	authenticate,
	userController.updateUser
);

router.patch(
	"/restore-account",
	validate(restoreUserAccountSchema),
	authenticate,
	userController.restoreUserAccount
);

router.delete(
	"/freeze-account",
	validate(freezeAccountSchema),
	authenticate,
	userController.freezeAccount
);

router.patch(
	"/restore-account",
	validate(restoreAccountSchema),
	authenticate,
	userController.restoreAccount
);

router.delete(
	"/hard-delete",
	validate(hardDeleteSchema),
	authenticate,
	userController.hardDelete
);

export default router;
