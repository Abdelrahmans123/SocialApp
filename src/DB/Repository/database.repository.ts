import { FlattenMaps, QueryOptions } from "mongoose";
import { ProjectionType, RootFilterQuery } from "mongoose";
import { CreateOptions, HydratedDocument, Model } from "mongoose";

export abstract class DatabaseRepository<TDocument> {
	protected model: Model<TDocument>;

	constructor(model: Model<TDocument>) {
		this.model = model;
	}

	async create({
		data,
		options,
	}: {
		data: Partial<TDocument>[];
		options?: CreateOptions;
	}): Promise<HydratedDocument<TDocument>[] | undefined> {
		return await this.model.create(data, options);
	}
	async findOne({
		filter,
		selection,
		options,
	}: {
		filter: RootFilterQuery<TDocument>;
		selection?: ProjectionType<TDocument> | null;
		options?: QueryOptions<TDocument> | null;
	}): Promise<
		| HydratedDocument<FlattenMaps<TDocument>>
		| HydratedDocument<TDocument>
		| null
	> {
		const query = this.model.findOne(filter).select(selection || {});
		if (options && options?.lean) {
			query.lean();
		}
		return await query.exec();
	}
	async update({
		filter,
		update,
		notUsedData,
		options,
	}: {
		filter: RootFilterQuery<TDocument>;
		update: Partial<TDocument>;
		notUsedData?: Partial<TDocument>;
		options?: QueryOptions<TDocument>;
	}): Promise<HydratedDocument<TDocument> | null> {
		console.log("🚀 ~ DatabaseRepository ~ update ~ filter:", filter);
		console.log("🚀 ~ DatabaseRepository ~ update ~ update:", update);
		const result = await this.model.findOneAndUpdate(
			filter,
			{ $set: update, ...(notUsedData ? { $unset: notUsedData } : {}) },
			{ new: true, ...(options || {}) }
		);
		console.log("🚀 ~ DatabaseRepository ~ update ~ update result:", update);
		console.log("🚀 ~ DatabaseRepository ~ update ~ result:", result);
		return result;
	}
}
