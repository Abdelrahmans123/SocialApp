import { Request, Response } from "express";
import { Types } from "mongoose";
import Post from "../../DB/model/Post.model"; // Adjust path as needed
import { IUser } from "../../DB/model/User.model";
import {
	findAll,
	findById,
	findByIdAndDelete,
	findByIdAndUpdate,
	findOne,
	create,
} from "../../DB/services/DBService";

// Interface for bulk operation results
interface BulkOperationResult {
	success: boolean;
	postId: string;
	error?: string;
}

interface BulkOperationSummary {
	totalRequested: number;
	successful: number;
	failed: number;
	results: BulkOperationResult[];
}

// ✅ Create a new post
export const createPost = async (
	req: Request,
	res: Response
): Promise<Response> => {
	try {
		const { title, content, author, tags, images } = req.body;
		const post = await create(Post, {
			title,
			content,
			author,
			tags,
			images,
		});
		return res.status(201).json(post);
	} catch (error) {
		return res.status(500).json({ error });
	}
};

// ✅ Get all posts
export const getPosts = async (
	req: Request,
	res: Response
): Promise<Response> => {
	try {
		const { page = 1, limit = 10, author, tags, published, search } = req.query;

		const filter: any = { isDeleted: false };

		if (author) filter.author = author;
		if (tags) filter.tags = { $in: (tags as string).split(",") };
		if (published !== undefined) filter.isPublished = published === "true";
		if (search) {
			filter.$or = [
				{ title: { $regex: search as string, $options: "i" } },
				{ content: { $regex: search as string, $options: "i" } },
			];
		}

		const posts = await findAll(Post, {
			filter,
			populate: [
				{ path: "author", select: "name email avatar" },
				{ path: "comments.user", select: "name avatar" },
			],
		});

		const sortedPosts = posts.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		);

		const startIndex = (Number(page) - 1) * Number(limit);
		const endIndex = startIndex + Number(limit);
		const paginatedPosts = sortedPosts.slice(startIndex, endIndex);

		return res.json({
			posts: paginatedPosts,
			totalPosts: sortedPosts.length,
			currentPage: Number(page),
			totalPages: Math.ceil(sortedPosts.length / Number(limit)),
		});
	} catch (error) {
		return res.status(500).json({ error });
	}
};

// ✅ Get single post
export const getPost = async (
	req: Request,
	res: Response
): Promise<Response> => {
	try {
		if (!req.params.id) {
			return res.status(400).json({ message: "Post ID is required" });
		}

		// Increment view count
		await findByIdAndUpdate(Post, req.params.id, { $inc: { views: 1 } });

		const post = await findOne(Post, {
			filter: { _id: req.params.id, isDeleted: false },
			populate: [
				{ path: "author", select: "name email avatar" },
				{ path: "comments.user", select: "name avatar" },
				{ path: "likes", select: "name avatar" },
			],
		});

		if (!post) return res.status(404).json({ message: "Post not found" });
		return res.json(post);
	} catch (error) {
		return res.status(500).json({ error });
	}
};

export const updatePost = async (
	req: Request,
	res: Response
): Promise<Response> => {
	try {
		const { id, title, content, tags, images, isPublished } = req.body;
		const post = await findByIdAndUpdate(Post, id, {
			title,
			content,
			tags,
			images,
			isPublished,
		});
		return res.json(post);
	} catch (error) {
		return res.status(500).json({ error });
	}
};

export const searchPosts = async (
	req: Request,
	res: Response
): Promise<Response> => {
	try {
		const { q } = req.query;
		const posts = await findAll(Post, {
			filter: {
				$and: [
					{ isDeleted: false, isPublished: true },
					{
						$or: [
							{ title: { $regex: q as string, $options: "i" } },
							{ content: { $regex: q as string, $options: "i" } },
							{ tags: { $in: [new RegExp(q as string, "i")] } },
						],
					},
				],
			},
			populate: [{ path: "author", select: "name email avatar" }],
		});

		return res.json(posts);
	} catch (error) {
		return res.status(500).json({ error });
	}
};

// ✅ Get posts by author
export const getPostsByAuthor = async (
	req: Request,
	res: Response
): Promise<Response> => {
	try {
		if (!req.params.authorId) {
			return res.status(400).json({ message: "Author ID is required" });
		}

		const posts = await findAll(Post, {
			filter: { author: req.params.authorId, isDeleted: false },
			populate: [{ path: "author", select: "name email avatar" }],
		});

		const sortedPosts = posts.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		);

		return res.json(sortedPosts);
	} catch (error) {
		return res.status(500).json({ error });
	}
};

// ✅ Like/Unlike post
export const toggleLike = async (
	req: Request,
	res: Response
): Promise<Response> => {
	try {
		const { id, userId } = req.body;
		const post = await findById(Post, id);

		if (!post) return res.status(404).json({ message: "Post not found" });

		const likeIndex = post.likes.indexOf(userId);

		if (likeIndex === -1) {
			post.likes.push(userId);
		} else {
			post.likes.splice(likeIndex, 1);
		}

		const updatedPost = await findByIdAndUpdate(Post, id, {
			likes: post.likes,
		});

		return res.json({
			message: likeIndex === -1 ? "Post liked" : "Post unliked",
			likeCount: post.likes.length,
			post: updatedPost,
		});
	} catch (error) {
		return res.status(500).json({ error });
	}
};

// ✅ Add comment
export const addComment = async (
	req: Request,
	res: Response
): Promise<Response> => {
	try {
		const { id, userId, content } = req.body;
		const post = await findById(Post, id);

		if (!post) return res.status(404).json({ message: "Post not found" });
		const newComment = {
			_id: new Types.ObjectId(),
			user: userId,
			content,
			createdAt: new Date(),
		};
		post.comments.push(newComment);
		const updatedPost = await findByIdAndUpdate(Post, id, {
			comments: post.comments,
		});

		return res.json({
			message: "Comment added successfully",
			post: updatedPost,
		});
	} catch (error) {
		return res.status(500).json({ error });
	}
};

// ✅ Remove comment
export const removeComment = async (
	req: Request,
	res: Response
): Promise<Response> => {
	try {
		const { id, commentId } = req.body;
		const post = await findById(Post, id);

		if (!post) return res.status(404).json({ message: "Post not found" });

		post.comments = post.comments.filter(
			(comment) => comment._id.toString() !== commentId
		);

		const updatedPost = await findByIdAndUpdate(Post, id, {
			comments: post.comments,
		});

		return res.json({
			message: "Comment removed successfully",
			post: updatedPost,
		});
	} catch (error) {
		return res.status(500).json({ error });
	}
};

// ✅ Publish/Unpublish post
export const togglePublish = async (
	req: Request,
	res: Response
): Promise<Response> => {
	try {
		const { id } = req.body;
		const post = await findById(Post, id);

		if (!post) return res.status(404).json({ message: "Post not found" });

		const updatedPost = await findByIdAndUpdate(Post, id, {
			isPublished: !post.isPublished,
		});

		return res.json({
			message: post.isPublished ? "Post unpublished" : "Post published",
			post: updatedPost,
		});
	} catch (error) {
		return res.status(500).json({ error });
	}
};

// ✅ Soft delete post
export const deletePost = async (
	req: Request,
	res: Response
): Promise<Response> => {
	try {
		const { id } = req.body;
		const post = await findByIdAndUpdate(Post, id, { isDeleted: true });
		return res.json({ message: "Post deleted successfully", post });
	} catch (error) {
		return res.status(500).json({ error });
	}
};

// ✅ Restore post (Fixed function signature)
export const restorePost = async (
	req: Request,
	res: Response
): Promise<Response> => {
	try {
		const { postId } = req.body;
		const post = await findById(Post, postId);

		if (!post) return res.status(404).json({ message: "Post not found" });

		if (!post.isDeleted) {
			return res.status(400).json({ message: "Post is not deleted" });
		}

		const updatedPost = await findByIdAndUpdate(Post, postId, {
			isDeleted: false,
		});

		return res.json({
			message: "Post restored successfully",
			post: updatedPost,
		});
	} catch (error) {
		return res.status(500).json({ error });
	}
};

// ✅ Hard delete post
export const hardDelete = async (
	req: Request,
	res: Response
): Promise<Response> => {
	try {
		const { id } = req.body;
		await findByIdAndDelete(Post, id);
		return res.json({ message: "Post permanently deleted" });
	} catch (error) {
		return res.status(500).json({ error });
	}
};

// ✅ Get trending posts
export const getTrendingPosts = async (
	req: Request,
	res: Response
): Promise<Response> => {
	try {
		const { limit = 10 } = req.query;
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		const posts = await findAll(Post, {
			filter: {
				isDeleted: false,
				isPublished: true,
				createdAt: { $gte: sevenDaysAgo },
			},
			populate: [{ path: "author", select: "name email avatar" }],
		});

		const trendingPosts = posts
			.sort((a, b) => b.likes.length - a.likes.length)
			.slice(0, Number(limit));

		return res.json(trendingPosts);
	} catch (error) {
		return res.status(500).json({ error });
	}
};

export const bulkPostOperations = async (req: Request, res: Response) => {
	try {
		const user = req.user as unknown as IUser;
		const { postIds, operation, reason, scheduledAt } = req.body;

		if (user.role !== "admin") {
			return res.status(403).json({
				success: false,
				message: "Access denied. Admin privileges required.",
			});
		}

		const results: BulkOperationResult[] = [];
		let successCount = 0;
		let failureCount = 0;

		// Process each post individually to handle partial failures
		for (const postId of postIds) {
			try {
				let result: BulkOperationResult;

				switch (operation) {
					case "publish":
						result = await publishPost(postId, scheduledAt);
						break;
					case "unpublish":
						result = await unpublishPost(postId);
						break;
					case "delete":
						result = await softDeletePost(
							postId,
							(user._id as string).toString(),
							reason
						);
						break;
					case "restore":
						result = await restorePostBulk(
							postId,
							(user._id as string).toString(),
							reason
						);
						break;
					case "hard-delete":
						result = await hardDeletePost(postId);
						break;
					default:
						result = {
							success: false,
							postId,
							error: "Invalid operation",
						};
				}

				results.push(result);

				if (result.success) {
					successCount++;
				} else {
					failureCount++;
				}
			} catch (error) {
				failureCount++;
				results.push({
					success: false,
					postId,
					error:
						error instanceof Error ? error.message : "Unknown error occurred",
				});
			}
		}

		const summary: BulkOperationSummary = {
			totalRequested: postIds.length,
			successful: successCount,
			failed: failureCount,
			results,
		};

		// Determine response status based on results
		let statusCode = 200;
		let message = `Bulk ${operation} completed successfully`;

		if (failureCount === postIds.length) {
			statusCode = 400;
			message = `All ${operation} operations failed`;
		} else if (failureCount > 0) {
			statusCode = 207; // Multi-Status
			message = `Bulk ${operation} completed with some failures`;
		}

		return res.status(statusCode).json({
			success: failureCount < postIds.length,
			message,
			data: summary,
		});
	} catch (error) {
		console.error("Bulk post operations error:", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error during bulk operations",
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
};

// Helper function to publish a post
async function publishPost(
	postId: string,
	scheduledAt?: Date
): Promise<BulkOperationResult> {
	try {
		const post = await Post.findById(postId);

		if (!post) {
			return {
				success: false,
				postId,
				error: "Post not found",
			};
		}

		if (post.isDeleted) {
			return {
				success: false,
				postId,
				error: "Cannot publish deleted post",
			};
		}

		const updateData: any = {
			isPublished: true,
			publishedAt: new Date(),
		};

		if (scheduledAt) {
			updateData.scheduledAt = scheduledAt;
		}

		await Post.findByIdAndUpdate(postId, updateData);

		return {
			success: true,
			postId,
		};
	} catch (error) {
		return {
			success: false,
			postId,
			error: error instanceof Error ? error.message : "Failed to publish post",
		};
	}
}

// Helper function to unpublish a post
async function unpublishPost(postId: string): Promise<BulkOperationResult> {
	try {
		const post = await Post.findById(postId);

		if (!post) {
			return {
				success: false,
				postId,
				error: "Post not found",
			};
		}

		if (post.isDeleted) {
			return {
				success: false,
				postId,
				error: "Cannot unpublish deleted post",
			};
		}

		await Post.findByIdAndUpdate(postId, {
			isPublished: false,
			scheduledAt: undefined,
		});

		return {
			success: true,
			postId,
		};
	} catch (error) {
		return {
			success: false,
			postId,
			error:
				error instanceof Error ? error.message : "Failed to unpublish post",
		};
	}
}

// Helper function to soft delete a post
async function softDeletePost(
	postId: string,
	userId: string,
	reason?: string
): Promise<BulkOperationResult> {
	try {
		const post = await Post.findById(postId);

		if (!post) {
			return {
				success: false,
				postId,
				error: "Post not found",
			};
		}

		if (post.isDeleted) {
			return {
				success: false,
				postId,
				error: "Post is already deleted",
			};
		}

		await Post.findByIdAndUpdate(postId, {
			isDeleted: true,
			isPublished: false, // Unpublish when deleting
		});

		return {
			success: true,
			postId,
		};
	} catch (error) {
		return {
			success: false,
			postId,
			error: error instanceof Error ? error.message : "Failed to delete post",
		};
	}
}

// Helper function to restore a post (Fixed function signature for bulk operations)
async function restorePostBulk(
	postId: string,
	userId: string,
	reason?: string
): Promise<BulkOperationResult> {
	try {
		const post = await Post.findById(postId);

		if (!post) {
			return {
				success: false,
				postId,
				error: "Post not found",
			};
		}

		if (!post.isDeleted) {
			return {
				success: false,
				postId,
				error: "Post is not deleted",
			};
		}

		await Post.findByIdAndUpdate(postId, {
			isDeleted: false,
			isPublished: true,
		});

		return {
			success: true,
			postId,
		};
	} catch (error) {
		return {
			success: false,
			postId,
			error: error instanceof Error ? error.message : "Failed to restore post",
		};
	}
}

// Helper function to hard delete a post
async function hardDeletePost(postId: string): Promise<BulkOperationResult> {
	try {
		const post = await Post.findById(postId);

		if (!post) {
			return {
				success: false,
				postId,
				error: "Post not found",
			};
		}

		if (!post.isDeleted) {
			return {
				success: false,
				postId,
				error: "Post must be soft deleted first",
			};
		}

		await Post.findByIdAndDelete(postId);

		return {
			success: true,
			postId,
		};
	} catch (error) {
		return {
			success: false,
			postId,
			error:
				error instanceof Error ? error.message : "Failed to hard delete post",
		};
	}
}

// Middleware to check if user can perform bulk operations
export const checkBulkOperationPermission = (
	req: Request,
	res: Response,
	next: Function
) => {
	try {
		const user = req.user as unknown as IUser;

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Authentication required",
			});
		}

		// Check if user has admin role or specific bulk operation permission
		if (user.role !== "admin") {
			return res.status(403).json({
				success: false,
				message: "Insufficient permissions for bulk operations",
			});
		}

		return next();
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Error checking permissions",
		});
	}
};
