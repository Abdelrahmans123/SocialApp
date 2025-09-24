import mongoose, { Document, Schema, Model } from "mongoose";
import genderEnum from "../../utils/genderEnum.js";
import roleEnum from "../../utils/roleEnum.js";
import { generateHash } from "../../utils/security.js";
import { sendEmail } from "../../utils/sendEmail.js";

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
		otp: { type: String, required: false },
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
	}
);
userSchema.pre(
	"save",
	async function (
		this: IUserDocument & { wasNew: boolean; otp?: string; _plainOtp?: string },
		next
	) {
		this.wasNew = this.isNew;

		if (this.isModified("password")) {
			this.password = generateHash({ plainText: this.password });
		}

		if (this.isModified("otp") && this.otp) {
			this._plainOtp = this.otp;
			this.otp = generateHash({ plainText: this.otp });
		}

		next();
	}
);

userSchema.post(
	"save",
	async function (
		doc: IUserDocument & { wasNew: boolean; _plainOtp?: string },
		next
	) {
		if (doc.wasNew && doc._plainOtp) {
			await sendEmail({
				to: doc.email,
				subject: "Welcome to Social App",
				text: `Hello ${doc.name},\n\nYour OTP is: ${doc._plainOtp}`,
				html: `<h1>Hello ${doc.name},</h1>
            <p>Welcome to Social App!</p>
            <p>Your OTP is: <strong>${doc._plainOtp}</strong></p>`,
			});
		}
		next();
	}
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
