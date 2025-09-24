import { z } from "zod";

// Get Profile Schema
export const getProfileSchema = {
	params: z.object({
		id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
	}),
};

// Update Image Schema
export const updateImageSchema = {
	body: z.object({
		public_id: z.string().optional(),
		url: z.string().url("Please provide a valid image URL"),
	}),
};

// Search User Schema
export const searchUserSchema = {
	query: z.object({
		q: z
			.string()
			.min(1, "Search query cannot be empty")
			.max(100, "Search query cannot exceed 100 characters"),
		page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
		limit: z.coerce
			.number()
			.int()
			.min(1)
			.max(50, "Limit must be between 1 and 50")
			.default(10),
		gender: z.enum(["male", "female"]).optional(),
		role: z.enum(["user", "admin"]).optional(),
	}),
};

// Update User Schema
export const updateUserSchema = {
	body: z
		.object({
			name: z
				.string()
				.min(2, "Name must be at least 2 characters long")
				.max(50, "Name cannot exceed 50 characters")
				.optional(),
			phone: z
				.string()
				.regex(/^[0-9]{10,15}$/, {
					message:
						"Phone number must be between 10 to 15 digits and contain only numbers",
				})
				.optional(),
			gender: z
				.enum(["male", "female"], {
					message: "Gender must be either male or female",
				})
				.optional(),
			avatar: z
				.object({
					public_id: z.string().optional(),
					url: z.string().url("Please provide a valid avatar URL").optional(),
				})
				.optional(),
		})
		.refine(
			(data) =>
				Object.keys(data).some(
					(key) => data[key as keyof typeof data] !== undefined
				),
			{
				message: "At least one field must be provided for update",
			}
		),
};

// Restore User Account Schema
export const restoreUserAccountSchema = {
	body: z.object({
		userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
		reason: z
			.string()
			.max(500, "Reason cannot exceed 500 characters")
			.optional(),
	}),
};

// Freeze Account Schema
export const freezeAccountSchema = {
	body: z.object({
		reason: z
			.string()
			.min(10, "Reason must be at least 10 characters long")
			.max(500, "Reason cannot exceed 500 characters"),
		password: z.string().min(1, "Password is required for account freezing"),
	}),
};

// Restore Account Schema
export const restoreAccountSchema = {
	body: z.object({
		password: z.string().min(1, "Password is required for account restoration"),
		reason: z
			.string()
			.max(500, "Reason cannot exceed 500 characters")
			.optional(),
	}),
};

// Hard Delete Schema
export const hardDeleteSchema = {
	body: z.object({
		password: z
			.string()
			.min(1, "Password is required for permanent account deletion"),
		confirmDelete: z.literal("DELETE", {
			message: "Please type 'DELETE' to confirm permanent account deletion",
		}),
		reason: z
			.string()
			.max(500, "Reason cannot exceed 500 characters")
			.optional(),
	}),
};
