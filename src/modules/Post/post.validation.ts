import { z } from "zod";

// Create Post Schema
export const createPostSchema = {
	body: z
		.object({
			title: z
				.string()
				.min(3, "Title must be at least 3 characters long")
				.max(200, "Title cannot exceed 200 characters")
				.trim(),
			content: z
				.string()
				.min(10, "Content must be at least 10 characters long")
				.max(10000, "Content cannot exceed 10000 characters"),
			excerpt: z
				.string()
				.max(300, "Excerpt cannot exceed 300 characters")
				.optional(),
			tags: z
				.array(
					z
						.string()
						.min(1, "Tag cannot be empty")
						.max(30, "Tag cannot exceed 30 characters")
				)
				.max(10, "Cannot have more than 10 tags")
				.optional()
				.default([]),
			category: z
				.string()
				.min(2, "Category must be at least 2 characters long")
				.max(50, "Category cannot exceed 50 characters")
				.optional(),
			featuredImage: z
				.object({
					public_id: z.string().optional(),
					url: z.string().url("Please provide a valid image URL"),
				})
				.optional(),
			isPublished: z.boolean().default(false),
			scheduledAt: z.date().optional(),
			allowComments: z.boolean().default(true),
		})
		.refine(
			(data) => {
				// If scheduled, it should be published
				if (data.scheduledAt && !data.isPublished) {
					return false;
				}
				return true;
			},
			{
				message: "Scheduled posts must be published",
				path: ["isPublished"],
			}
		),
};

// Get Posts Schema
export const getPostsSchema = {
	query: z
		.object({
			page: z.coerce
				.number()
				.int()
				.min(1, "Page must be at least 1")
				.default(1),
			limit: z.coerce
				.number()
				.int()
				.min(1)
				.max(50, "Limit must be between 1 and 50")
				.default(10),
			sortBy: z
				.enum(["createdAt", "updatedAt", "likes", "comments", "views"])
				.default("createdAt"),
			sortOrder: z.enum(["asc", "desc"]).default("desc"),
			category: z
				.string()
				.max(50, "Category cannot exceed 50 characters")
				.optional(),
			tags: z.string().optional(), // Comma-separated tags
			isPublished: z.coerce.boolean().optional(),
			authorId: z
				.string()
				.regex(/^[0-9a-fA-F]{24}$/, "Invalid author ID format")
				.optional(),
			includeDeleted: z.coerce.boolean().default(false),
			dateFrom: z.coerce.date().optional(),
			dateTo: z.coerce.date().optional(),
		})
		.refine(
			(data) => {
				// Validate date range
				if (data.dateFrom && data.dateTo && data.dateFrom > data.dateTo) {
					return false;
				}
				return true;
			},
			{
				message: "Date from cannot be after date to",
				path: ["dateFrom"],
			}
		),
};

// Get Single Post Schema
export const getPostSchema = {
	params: z.object({
		id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID format"),
	}),
	query: z.object({
		incrementView: z.coerce.boolean().default(true),
	}),
};

// Update Post Schema
export const updatePostSchema = {
	body: z
		.object({
			id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID format"),
			title: z
				.string()
				.min(3, "Title must be at least 3 characters long")
				.max(200, "Title cannot exceed 200 characters")
				.trim()
				.optional(),
			content: z
				.string()
				.min(10, "Content must be at least 10 characters long")
				.max(10000, "Content cannot exceed 10000 characters")
				.optional(),
			excerpt: z
				.string()
				.max(300, "Excerpt cannot exceed 300 characters")
				.optional(),
			tags: z
				.array(
					z
						.string()
						.min(1, "Tag cannot be empty")
						.max(30, "Tag cannot exceed 30 characters")
				)
				.max(10, "Cannot have more than 10 tags")
				.optional(),
			category: z
				.string()
				.min(2, "Category must be at least 2 characters long")
				.max(50, "Category cannot exceed 50 characters")
				.optional(),
			featuredImage: z
				.object({
					public_id: z.string().optional(),
					url: z.string().url("Please provide a valid image URL"),
				})
				.optional(),
			scheduledAt: z.date().optional(),
			allowComments: z.boolean().optional(),
		})
		.refine(
			(data) =>
				Object.keys(data).filter(
					(key) => key !== "id" && data[key as keyof typeof data] !== undefined
				).length > 0,
			{
				message: "At least one field must be provided for update",
			}
		),
};

// Search Posts Schema
export const searchPostsSchema = {
	query: z.object({
		q: z
			.string()
			.min(2, "Search query must be at least 2 characters long")
			.max(100, "Search query cannot exceed 100 characters"),
		page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
		limit: z.coerce
			.number()
			.int()
			.min(1)
			.max(50, "Limit must be between 1 and 50")
			.default(10),
		category: z
			.string()
			.max(50, "Category cannot exceed 50 characters")
			.optional(),
		tags: z.string().optional(), // Comma-separated tags
		authorId: z
			.string()
			.regex(/^[0-9a-fA-F]{24}$/, "Invalid author ID format")
			.optional(),
		sortBy: z
			.enum(["relevance", "createdAt", "updatedAt", "likes", "views"])
			.default("relevance"),
		sortOrder: z.enum(["asc", "desc"]).default("desc"),
		onlyPublished: z.coerce.boolean().default(true),
	}),
};

// Get Trending Posts Schema
export const getTrendingPostsSchema = {
	query: z.object({
		period: z.enum(["day", "week", "month", "year", "all"]).default("week"),
		limit: z.coerce
			.number()
			.int()
			.min(1)
			.max(50, "Limit must be between 1 and 50")
			.default(10),
		category: z
			.string()
			.max(50, "Category cannot exceed 50 characters")
			.optional(),
	}),
};

// Get Posts by Author Schema
export const getPostsByAuthorSchema = {
	params: z.object({
		authorId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid author ID format"),
	}),
	query: z.object({
		page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
		limit: z.coerce
			.number()
			.int()
			.min(1)
			.max(50, "Limit must be between 1 and 50")
			.default(10),
		sortBy: z
			.enum(["createdAt", "updatedAt", "likes", "views"])
			.default("createdAt"),
		sortOrder: z.enum(["asc", "desc"]).default("desc"),
		onlyPublished: z.coerce.boolean().default(true),
		includeDeleted: z.coerce.boolean().default(false),
	}),
};

// Toggle Like Schema
export const toggleLikeSchema = {
	body: z.object({
		postId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID format"),
	}),
};

// Add Comment Schema
export const addCommentSchema = {
	body: z.object({
		postId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID format"),
		content: z
			.string()
			.min(1, "Comment cannot be empty")
			.max(1000, "Comment cannot exceed 1000 characters")
			.trim(),
		parentId: z
			.string()
			.regex(/^[0-9a-fA-F]{24}$/, "Invalid parent comment ID format")
			.optional(),
	}),
};

// Remove Comment Schema
export const removeCommentSchema = {
	body: z.object({
		postId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID format"),
		commentId: z
			.string()
			.regex(/^[0-9a-fA-F]{24}$/, "Invalid comment ID format"),
		reason: z
			.string()
			.max(500, "Reason cannot exceed 500 characters")
			.optional(),
	}),
};

// Toggle Publish Schema
export const togglePublishSchema = {
	body: z
		.object({
			postId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID format"),
			isPublished: z.boolean(),
			scheduledAt: z.date().optional(),
		})
		.refine(
			(data) => {
				// If unpublishing, scheduledAt should not be set
				if (!data.isPublished && data.scheduledAt) {
					return false;
				}
				return true;
			},
			{
				message: "Cannot schedule unpublished posts",
				path: ["scheduledAt"],
			}
		),
};

// Delete Post Schema (Soft Delete)
export const deletePostSchema = {
	body: z.object({
		postId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID format"),
		reason: z
			.string()
			.max(500, "Reason cannot exceed 500 characters")
			.optional(),
	}),
};

// Restore Post Schema
export const restorePostSchema = {
	body: z.object({
		postId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID format"),
		reason: z
			.string()
			.max(500, "Reason cannot exceed 500 characters")
			.optional(),
	}),
};

// Hard Delete Schema
export const hardDeleteSchema = {
	body: z.object({
		postId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID format"),
		confirmDelete: z.literal("DELETE", {
			message: "Please type 'DELETE' to confirm permanent post deletion",
		}),
		reason: z
			.string()
			.max(500, "Reason cannot exceed 500 characters")
			.optional(),
	}),
};

// Additional Schemas for extended functionality

// Bulk Post Operations Schema
export const bulkPostOperationsSchema = {
	body: z.object({
		postIds: z
			.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID format"))
			.min(1, "At least one post ID is required")
			.max(50, "Cannot process more than 50 posts at once"),
		operation: z.enum([
			"publish",
			"unpublish",
			"delete",
			"restore",
			"hard-delete",
		]),
		reason: z
			.string()
			.max(500, "Reason cannot exceed 500 characters")
			.optional(),
		scheduledAt: z.date().optional(),
	}),
};

// Get Post Analytics Schema
export const getPostAnalyticsSchema = {
	params: z.object({
		id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID format"),
	}),
	query: z.object({
		period: z.enum(["day", "week", "month", "year", "all"]).default("month"),
		metrics: z.string().optional(), // Comma-separated metrics like "views,likes,comments"
	}),
};

// Update Post Status Schema
export const updatePostStatusSchema = {
	body: z
		.object({
			postId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID format"),
			status: z.enum(["draft", "published", "archived", "scheduled"]),
			scheduledAt: z.date().optional(),
		})
		.refine(
			(data) => {
				// If status is scheduled, scheduledAt is required
				if (data.status === "scheduled" && !data.scheduledAt) {
					return false;
				}
				// If status is not scheduled, scheduledAt should not be set
				if (data.status !== "scheduled" && data.scheduledAt) {
					return false;
				}
				return true;
			},
			{
				message: "Scheduled posts require a scheduled date",
				path: ["scheduledAt"],
			}
		),
};

// Report Post Schema
export const reportPostSchema = {
	body: z.object({
		postId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID format"),
		reason: z.enum([
			"spam",
			"harassment",
			"inappropriate",
			"copyright",
			"misinformation",
			"other",
		]),
		description: z
			.string()
			.min(10, "Report description must be at least 10 characters long")
			.max(1000, "Report description cannot exceed 1000 characters"),
	}),
};
