import { z } from "zod";

// Login Schema
export const loginSchema = {
	body: z.object({
		email: z.string().email("Please provide a valid email address"),
		password: z.string().min(8, "Password must be at least 8 characters long"),
	}),
};

// Register Schema
export const registerSchema = {
	body: loginSchema.body
		.extend({
			name: z
				.string()
				.min(2, "Name must be at least 2 characters long")
				.max(50, "Name cannot exceed 50 characters")
				.nonempty("Name cannot be empty"),
			gender: z.enum(["male", "female"], {
				message: "Gender must be either male or female",
			}),
			confirmPassword: z
				.string()
				.min(8, "Confirm password must be at least 8 characters long"),
			phone: z.string().regex(/^[0-9]{10,15}$/, {
				message:
					"Phone number must be between 10 to 15 digits and contain only numbers",
			}),
			role: z.enum(["user", "admin"]).default("user"),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: "Confirm password must match password",
			path: ["confirmPassword"],
		}),
};
