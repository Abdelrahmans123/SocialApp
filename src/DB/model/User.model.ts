import mongoose, { Document, Schema, Model } from "mongoose";
import genderEnum from "../../utils/genderEnum.js";
import roleEnum from "../../utils/roleEnum.js";

export interface IAvatar {
	public_id?: string;
	url?: string;
}

export interface IUser extends Document {
	name: string;
	email: string;
	password: string;
	phone?: string;
	confirmEmail?: Date;
	gender: (typeof genderEnum)[keyof typeof genderEnum];
	otp: string;
	role: (typeof roleEnum)[keyof typeof roleEnum];
	avatar?: IAvatar;
	deletedAt?: Date;
	deletedBy?: mongoose.Types.ObjectId;
	restoreAt?: Date;
	restoreBy?: mongoose.Types.ObjectId;
	changeCredintialTime?: Date;
	createdAt?: Date;
	updatedAt?: Date;
}
export interface IUserDocument extends IUser, Document {
	_id: string; 
	role: string; 
}
const userSchema = new Schema<IUser>(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		phone: { type: String },
		confirmEmail: { type: Date },
		gender: {
			type: String,
			enum: Object.values(genderEnum),
			default: genderEnum.male,
		},
		otp: { type: String, required: true },
		role: {
			type: String,
			enum: Object.values(roleEnum),
			default: roleEnum.user,
		},
		avatar: {
			public_id: { type: String },
			url: { type: String },
		},
		deletedAt: { type: Date },
		deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
		restoreAt: { type: Date },
		restoreBy: { type: Schema.Types.ObjectId, ref: "User" },
		changeCredintialTime: { type: Date },
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

userSchema.virtual("messages", {
	ref: "Message",
	localField: "_id",
	foreignField: "receiver",
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
