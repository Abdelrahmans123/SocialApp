import { Router } from "express";
import {
	createPost,
	getPosts,
	getPost,
	updatePost,
	searchPosts,
	getPostsByAuthor,
	toggleLike,
	addComment,
	removeComment,
	togglePublish,
	deletePost,
	restorePost,
	hardDelete,
	getTrendingPosts,
	bulkPostOperations,
	checkBulkOperationPermission,
} from "./post.service";
import { validate } from "../../middleware/validation.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import {
	createPostSchema,
	getPostsSchema,
	getPostSchema,
	updatePostSchema,
	searchPostsSchema,
	getPostsByAuthorSchema,
	toggleLikeSchema,
	addCommentSchema,
	removeCommentSchema,
	togglePublishSchema,
	deletePostSchema,
	restorePostSchema,
	hardDeleteSchema,
	getTrendingPostsSchema,
	bulkPostOperationsSchema,
} from "./post.validation";

const router = Router();

// Create Post
router.post("/create", validate(createPostSchema), authenticate, createPost);

// Get All Posts
router.get("/", validate(getPostsSchema), getPosts);

// Search Posts
router.get("/search", validate(searchPostsSchema), searchPosts);

// Get Trending Posts
router.get("/trending", validate(getTrendingPostsSchema), getTrendingPosts);

// Get Posts by Author
router.get(
	"/author/:authorId",
	validate(getPostsByAuthorSchema),
	getPostsByAuthor
);

// Bulk Post Operations (Admin) - Place before /:id route to avoid conflicts
router.post(
	"/bulk-operations",
	validate(bulkPostOperationsSchema),
	authenticate,
	checkBulkOperationPermission,
	bulkPostOperations
);

// Get Single Post (should be after specific routes to avoid conflicts)
router.get("/:id", validate(getPostSchema), getPost);

// Update Post
router.put("/update", validate(updatePostSchema), authenticate, updatePost);

// Toggle Like
router.patch("/like", validate(toggleLikeSchema), authenticate, toggleLike);

// Add Comment
router.post("/comment", validate(addCommentSchema), authenticate, addComment);

// Remove Comment
router.delete(
	"/comment",
	validate(removeCommentSchema),
	authenticate,
	removeComment
);

// Toggle Publish Status
router.patch(
	"/publish",
	validate(togglePublishSchema),
	authenticate,
	togglePublish
);

// Soft Delete Post
router.delete("/delete", validate(deletePostSchema), authenticate, deletePost);

// Restore Post
router.patch(
	"/restore",
	validate(restorePostSchema),
	authenticate,
	restorePost
);

// Hard Delete Post
router.delete(
	"/hard-delete",
	validate(hardDeleteSchema),
	authenticate,
	hardDelete
);

export default router;
