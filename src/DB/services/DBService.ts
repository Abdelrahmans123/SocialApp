import {
	Model,
	Document,
	FilterQuery,
	UpdateQuery,
	PopulateOptions,
} from "mongoose";

// Updated findOne to match controller usage
export const findOne = async <T extends Document>(
	model: Model<T>,
	options: {
		filter: FilterQuery<T>;
		selection?: string | Record<string, unknown>;
		populate?: PopulateOptions | (string | PopulateOptions)[];
	}
): Promise<T | null> => {
	try {
		let queryExec = model.findOne(options.filter, options.selection);
		if (options.populate) queryExec = queryExec.populate(options.populate);
		return await queryExec;
	} catch (error) {
		console.error("Error finding document:", error);
		throw error;
	}
};

// Updated findAll to match controller usage
export const findAll = async <T extends Document>(
	model: Model<T>,
	options: {
		filter?: FilterQuery<T>;
		selection?: string | Record<string, unknown>;
		populate?: PopulateOptions | (string | PopulateOptions)[];
		sort?: Record<string, 1 | -1>;
		skip?: number;
		limit?: number;
	} = {}
): Promise<T[]> => {
	try {
		let queryExec = model.find(options.filter || {}, options.selection);

		if (options.populate) queryExec = queryExec.populate(options.populate);
		if (options.sort) queryExec = queryExec.sort(options.sort);
		if (options.skip) queryExec = queryExec.skip(options.skip);
		if (options.limit) queryExec = queryExec.limit(options.limit);

		return await queryExec;
	} catch (error) {
		console.error("Error finding documents:", error);
		throw error;
	}
};

// Updated findById with populate support
export const findById = async <T extends Document>(
	model: Model<T>,
	id: string,
	selection?: Record<string, unknown> | string | null,
	populate?: PopulateOptions | (string | PopulateOptions)[]
): Promise<T | null> => {
	try {
		let queryExec = model.findById(id, selection || undefined);
		if (populate) queryExec = queryExec.populate(populate);
		return await queryExec;
	} catch (error) {
		console.error("Error finding document by ID:", error);
		throw error;
	}
};

export const create = async <T extends Document>(
	model: Model<T>,
	data: Partial<T>
): Promise<T> => {
	try {
		return await model.create(data);
	} catch (error) {
		console.error("Error creating document:", error);
		throw error;
	}
};

export const update = async <T extends Document>(
	model: Model<T>,
	query: FilterQuery<T>,
	data: UpdateQuery<T>
): Promise<T | null> => {
	try {
		return await model.findOneAndUpdate(query, data, { new: true });
	} catch (error) {
		console.error("Error updating document:", error);
		throw error;
	}
};

export const updateOne = async <T extends Document>(
	model: Model<T>,
	query: FilterQuery<T>,
	data: UpdateQuery<T>
): Promise<{
	acknowledged: boolean;
	matchedCount: number;
	modifiedCount: number;
}> => {
	try {
		return await model.updateOne(query, data);
	} catch (error) {
		console.error("Error updating document:", error);
		throw error;
	}
};

export const findByIdAndUpdate = async <T extends Document>(
	model: Model<T>,
	id: string,
	data: UpdateQuery<T>,
	populate?: PopulateOptions | (string | PopulateOptions)[]
): Promise<T | null> => {
	try {
		let queryExec = model.findByIdAndUpdate(id, data, { new: true });
		if (populate) queryExec = queryExec.populate(populate);
		return await queryExec;
	} catch (error) {
		console.error("Error updating document by ID:", error);
		throw error;
	}
};

// Added missing findByIdAndDelete function
export const findByIdAndDelete = async <T extends Document>(
	model: Model<T>,
	id: string
): Promise<T | null> => {
	try {
		return await model.findByIdAndDelete(id);
	} catch (error) {
		console.error("Error deleting document by ID:", error);
		throw error;
	}
};

export const remove = async <T extends Document>(
	model: Model<T>,
	query: FilterQuery<T>
): Promise<T | null> => {
	try {
		return await model.findOneAndDelete(query);
	} catch (error) {
		console.error("Error deleting document:", error);
		throw error;
	}
};

// Count documents
export const countDocuments = async <T extends Document>(
	model: Model<T>,
	query: FilterQuery<T> = {}
): Promise<number> => {
	try {
		return await model.countDocuments(query);
	} catch (error) {
		console.error("Error counting documents:", error);
		throw error;
	}
};

// Aggregate function for complex queries
export const aggregate = async <T extends Document>(
	model: Model<T>,
	pipeline: any[]
): Promise<any[]> => {
	try {
		return await model.aggregate(pipeline);
	} catch (error) {
		console.error("Error in aggregation:", error);
		throw error;
	}
};
