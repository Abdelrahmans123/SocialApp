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
		options,
	}: {
		filter: RootFilterQuery<TDocument>;
		update: Partial<TDocument>;
		options?: QueryOptions<TDocument>;
	}): Promise<HydratedDocument<TDocument> | null> {
		return await this.model.findOneAndUpdate(
			filter,
			{ $set: update },
			{ new: true, ...options }
		);
	}
}
