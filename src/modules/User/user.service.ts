import { Request, Response } from "express";
import User from "../../DB/model/User.model";
import {
	findAll,
	findById,
	findByIdAndDelete,
	findByIdAndUpdate,
} from "../../DB/services/DBService";

// ✅ Get user profile
export const getProfile = async (
	req: Request,
	res: Response
): Promise<Response> => {
	try {
		if (!req.params.id) {
			return res.status(400).json({ message: "User ID is required" });
		}
		const user = await findById(User, req.params.id, "-password");
		if (!user) return res.status(404).json({ message: "User not found" });
		return res.json(user);
	} catch (error) {
		return res.status(500).json({ error });
	}
};
export const updateImage = async (
	req: Request,
	res: Response
): Promise<Response> => {
	try {
		const { id, avatar } = req.body;
		const user = await findByIdAndUpdate(User, id, { avatar });
		return res.json(user);
	} catch (error) {
		return res.status(500).json({ error });
	}
};

export const searchUser = async (req: Request, res: Response) => {
	try {
		const { q } = req.query;
		const users = await findAll(User, {
			filter: {
				$or: [
					{ name: { $regex: q as string, $options: "i" } },
					{ email: { $regex: q as string, $options: "i" } },
				],
			},
		});
		const filteredUsers = users.map((user) => {
			const userObj = user.toObject();
			delete userObj.password;
			return userObj;
		});

		res.json(filteredUsers);
	} catch (error) {
		res.status(500).json({ error });
	}
};

export const updateUser = async (req: Request, res: Response) => {
	try {
		const { id, name, phone } = req.body;
		const user = await findByIdAndUpdate(User, id, { name, phone });
		res.json(user);
	} catch (error) {
		res.status(500).json({ error });
	}
};

export const restoreUserAccount = async (req: Request, res: Response) => {
	try {
		const { id } = req.body;
		const user = await findByIdAndUpdate(User, id, { isDeleted: false });
		res.json(user);
	} catch (error) {
		res.status(500).json({ error });
	}
};

export const freezeAccount = async (req: Request, res: Response) => {
	try {
		const { id } = req.body;
		const user = await findByIdAndUpdate(User, id, { isFrozen: true });
		res.json(user);
	} catch (error) {
		res.status(500).json({ error });
	}
};

export const restoreAccount = async (req: Request, res: Response) => {
	try {
		const { id } = req.body;
		const user = await findByIdAndUpdate(User, id, { isFrozen: false });
		res.json(user);
	} catch (error) {
		res.status(500).json({ error });
	}
};

export const hardDelete = async (req: Request, res: Response) => {
	try {
		const { id } = req.body;
		await findByIdAndDelete(User, id);
		res.json({ message: "User permanently deleted" });
	} catch (error) {
		res.status(500).json({ error });
	}
};
