import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPost extends Document {
	_id: Types.ObjectId;
	title: string;
	content: string;
	author: Types.ObjectId;
	tags?: string[];
	images?: string[];
	likes: Types.ObjectId[];
	comments: {
        _id: any;
		user: Types.ObjectId;
		content: string;
		createdAt: Date;
	}[];
	isPublished: boolean;
	isDeleted: boolean;
	views: number;
	createdAt: Date;
	updatedAt: Date;
}

const PostSchema: Schema<IPost> = new Schema(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
			maxlength: [200, "Title cannot be more than 200 characters"],
		},
		content: {
			type: String,
			required: [true, "Content is required"],
			trim: true,
		},
		author: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Author is required"],
		},
		tags: [
			{
				type: String,
				trim: true,
				lowercase: true,
			},
		],
		images: [
			{
				type: String,
				trim: true,
			},
		],
		likes: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
			},
		],
		comments: [
			{
				user: {
					type: Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
				content: {
					type: String,
					required: true,
					trim: true,
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		isPublished: {
			type: Boolean,
			default: true,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		views: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ isPublished: 1, isDeleted: 1 });
PostSchema.index({ title: "text", content: "text" });
PostSchema.virtual("likeCount").get(function () {
	return this.likes.length;
});
PostSchema.virtual("commentCount").get(function () {
	return this.comments.length;
});

PostSchema.set("toJSON", { virtuals: true });
PostSchema.set("toObject", { virtuals: true });

export default mongoose.model<IPost>("Post", PostSchema);
