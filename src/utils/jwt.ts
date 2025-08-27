// src/utils/jwt.ts
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

export interface JWTPayload extends JwtPayload {
	id: string;
	role: string;
	jti?: string;
}

// Generate JWT
export const generateJWT = (
	user: { _id: string; role: string },
	expiresIn: SignOptions["expiresIn"] = "1h",
	jwtId?: string
): string => {
	if (!process.env.JWT_SECRET_KEY) {
		throw new Error("JWT_SECRET_KEY is not defined in environment variables");
	}

	const payload: JWTPayload = {
		id: String(user._id),
		role: user.role,
	};

	const options: SignOptions = {
		expiresIn,
		jwtid: jwtId,
	};

	return jwt.sign(payload, process.env.JWT_SECRET_KEY, options);
};

// Verify JWT
export const verifyJWT = (token: string): JWTPayload => {
	if (!process.env.JWT_SECRET_KEY) {
		throw new Error("JWT_SECRET_KEY is not defined in environment variables");
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
		if (typeof decoded === "string") {
			throw new Error("Invalid token structure");
		}
		return decoded as JWTPayload;
	} catch {
		throw new Error("Invalid or expired token");
	}
};
