import {
	Model,
	Document,
	FilterQuery,
	UpdateQuery,
	PopulateOptions,
} from "mongoose";

export const findOne = async <T extends Document>(
	model: Model<T>,
	query: FilterQuery<T>,
	filter: Record<string, unknown> | null = null,
	populate: PopulateOptions | (string | PopulateOptions)[] | null = null
): Promise<T | null> => {
	try {
		let queryExec = model.findOne(query, filter || undefined);
		if (populate) queryExec = queryExec.populate(populate);
		return await queryExec;
	} catch (error) {
		console.error("Error finding document:", error);
		throw error;
	}
};

export const findAll = async <T extends Document>(
	model: Model<T>,
	query: FilterQuery<T> = {}
): Promise<T[]> => {
	try {
		return await model.find(query);
	} catch (error) {
		console.error("Error finding documents:", error);
		throw error;
	}
};

export const findById = async <T extends Document>(
	model: Model<T>,
	id: string,
	filter: Record<string, unknown> | null = null
): Promise<T | null> => {
	try {
		return await model.findById(id, filter || undefined);
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
	data: UpdateQuery<T>
): Promise<T | null> => {
	try {
		return await model.findByIdAndUpdate(id, data, { new: true });
	} catch (error) {
		console.error("Error updating document by ID:", error);
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
