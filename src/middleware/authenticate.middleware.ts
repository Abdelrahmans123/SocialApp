import { Request, Response, NextFunction } from "express";
import { verifyJWT } from "../utils/jwt.js";
import Token from "../DB/model/Token.model";
import User from "../DB/model/User.model";

// Shape of your decoded JWT payload
interface DecodedToken {
	id: string;
	iat: number;
	exp: number;
	jti: string;
}

// Extend Express Request to carry user
declare module "express-serve-static-core" {
	interface Request {
		user?: DecodedToken;
	}
}

export const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const token = req.headers.authorization;

	if (!token) {
		return next(
			new Error("Authentication token is missing", { cause: 401 } as any)
		);
	}

	let decoded: DecodedToken;
	try {
		decoded = verifyJWT(token) as DecodedToken;
	} catch (err) {
		return next(new Error("Invalid or expired token", { cause: 401 } as any));
	}

	const tokenModel = await Token.findOne({ jwtId: decoded.jti });
	if (decoded.jti && tokenModel) {
		return next(
			new Error("Session expired, please login again", { cause: 401 } as any)
		);
	}

	const user = await User.findById(decoded.id);
	if (!user) {
		return next(new Error("User not found", { cause: 404 } as any));
	}

	if (user?.changeCredintialTime && user.changeCredintialTime.getTime() > decoded.iat * 1000) {
		return next(
			new Error("Session expired, please login again", { cause: 401 } as any)
		);
	}

	req.user = decoded;
	next();
};
