import { CreateOptions, Model, FilterQuery } from "mongoose";
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
	async updateUser({
		filter,
		data,
		notUsedData,
	}: {
		filter: FilterQuery<IUser>; 
		data: Partial<IUser>;
		notUsedData?: Partial<IUser>;	
	}): Promise<IUser | undefined> {
		console.log("🚀 ~ UserRepository ~ updateUser ~ filter:", filter);
		console.log("🚀 ~ UserRepository ~ updateUser ~ data:", data);
		const user = await this.update({
			filter: filter,
			update: data,
			...(notUsedData && { notUsedData }), 
		});

		if (!user) {
			console.log("🚀 ~ UserRepository ~ No user returned from update");
			throw new ApplicationError(500, "User update failed - no user returned");
		}
		return user;
	}
}
