// src/db/models/Token.model.ts
import mongoose, { Document, Schema, Model } from "mongoose";

export interface IToken extends Document {
	userId: mongoose.Types.ObjectId;
	jwtId: string;
	expireIn: Date;
	createdAt?: Date;
	updatedAt?: Date;
}

const tokenSchema = new Schema<IToken>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		jwtId: { type: String, required: true, unique: true },
		expireIn: { type: Date, required: true },
	},
	{
		timestamps: true,
	}
);

const Token: Model<IToken> = mongoose.model<IToken>("Token", tokenSchema);

export default Token;
