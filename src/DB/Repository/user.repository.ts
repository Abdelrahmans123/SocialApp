import { CreateOptions, Model } from "mongoose";
import { IUser } from "../model/User.model";
import { DatabaseRepository } from "./database.repository";
import ApplicationError from "../../utils/ApplicationError";

export class UserRepository extends DatabaseRepository<IUser> {
	constructor(protected override readonly model: Model<IUser>) {
		super(model);
	}
	async createUser({
		data,
		options,
	}: {
		data: Partial<IUser>[];
		options?: CreateOptions;
	}): Promise<IUser[] | undefined> {
		const users = await this.create({ data, ...(options && { options }) });
		if (!users) {
			throw new ApplicationError(500, "User creation failed");
		}
		return users;
	}
}
