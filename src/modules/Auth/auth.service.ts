import type { NextFunction, Request, Response } from "express";
import type { IRegisterData } from "./auth.dto";
import { sendEmail } from "../../utils/sendEmail";
import User, { IUserDocument } from "../../DB/model/User.model";
import { compareHash, encrypt, generateHash } from "../../utils/security";
import { customAlphabet, nanoid } from "nanoid";
import ApplicationError from "../../utils/ApplicationError";
import { generateJWT } from "../../utils/jwt";
import { UserRepository } from "../../DB/Repository/user.repository";
import Token from "../../DB/model/Token.model";
import { TokenRepository } from "../../DB/Repository/token.repository";
import mongoose from "mongoose";
interface ForgotPasswordBody {
	email: string;
}

interface ResetPasswordBody {
	email: string;
	otp: string | null;
	newPassword: string;
}

interface LogoutBody {
	flag?: "all" | string;
}
interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		iat: number;
		exp: number;
		jti: string;
	};
}
class AuthService {
	private userModel = new UserRepository(User);
	private tokenModel = new TokenRepository(Token);

	constructor() {
		// Initialize any necessary properties or dependencies
	}
	public register = async (req: Request, res: Response): Promise<Response> => {
		const { name, password, email, phone, gender, role } =
			req.body as IRegisterData;

		const existingUser = await this.userModel.findOne({ filter: { email } });
		if (existingUser) {
			throw new ApplicationError(409, "Email Already Exist");
		}

		const hashedPassword = generateHash({ plainText: password });
		const encryptPhone = encrypt({
			plainText: phone,
			secretKey: process.env.SECRET_KEY ?? "",
		});

		const otp = customAlphabet("0123456789", 6)();
		const otpHash = generateHash({ plainText: otp });

		const [newUser] =
			(await this.userModel.createUser({
				data: [
					{
						name,
						password: hashedPassword,
						email,
						phone: encryptPhone,
						gender,
						otp: otpHash,
						role,
					},
				],
			})) || [];

		await sendEmail({
			to: email,
			subject: "Welcome to Social App",
			text: `Hello ${name},\n\nThank you for registering with Social App. We are excited to have you on board!\n\nBest regards,\nSocial App Team`,
			html: `<h1>Hello ${name},</h1>
		       <p>Thank you for registering with Social App. We are excited to have you on board!</p>
		       <p>Best regards,<br>Social App Team</p>
		       <p>Your OTP is: <strong>${otp}</strong></p>`,
		});

		return res.status(201).json({
			message: "User registered successfully",
			data: newUser,
		});
	};

	public login = async (req: Request, res: Response): Promise<Response> => {
		const { email, password } = req.body as {
			email: string;
			password: string;
		};

		const user = (await this.userModel.findOne({
			filter: { email },
		})) as IUserDocument;
		if (!user) {
			throw new ApplicationError(401, "Invalid email or password");
		}

		const isPasswordValid = compareHash({
			plainText: password,
			hash: user.password,
		});
		if (!isPasswordValid) {
			throw new ApplicationError(401, "Invalid email or password");
		}

		if (!user.confirmEmail) {
			throw new ApplicationError(
				403,
				"Please confirm your email before logging in"
			);
		}

		const jwtId = nanoid();

		const jwtPayload = {
			_id: user._id.toString(),
			role: user.role,
		};

		const accessToken = generateJWT(jwtPayload, "3000s", jwtId);
		const refreshToken = generateJWT(jwtPayload, "1d", jwtId);

		return res.status(200).json({
			message: "User logged in successfully",
			data: { accessToken, refreshToken },
		});
	};
	public confirmEmail = async (
		req: Request,
		res: Response
	): Promise<Response> => {
		const { email, otp } = req.body as { email: string; otp: string };

		const user = await this.userModel.findOne({
			filter: { email, otp: { $exists: true } },
		});
		if (!user) {
			throw new ApplicationError(404, "User not found");
		}

		const isOtpValid = compareHash({ plainText: otp, hash: user.otp });
		if (!isOtpValid) {
			throw new ApplicationError(400, "Invalid OTP");
		}

		await this.userModel.update({
			filter: { email },
			update: { confirmEmail: true, $unset: { otp: 1 } } as any,
		});

		return res.status(200).json({
			message: "Email confirmed successfully",
			data: { userId: user._id, name: user.name, email: user.email },
		});
	};
	public forgotPassword = async (
		req: Request<{}, {}, ForgotPasswordBody>,
		res: Response,
		next: NextFunction
	) => {
		console.log("🔥 forgotPassword method triggered");

		const { email } = req.body;
		const user = await this.userModel.findOne({ filter: { email } });
		console.log("🚀 ~ AuthService ~ user:", user);

		if (!user) {
			throw new ApplicationError(404, "User not found");
		}

		console.log("🚀 ~ AuthService ~ otpHash:", "hELL");
		const otp = customAlphabet("0123456789", 6)();
		const otpHash = generateHash({ plainText: otp });

		const updateUser = await this.userModel.update({
			filter: { email },
			update: { otp: otpHash },
		});
		console.log("🚀 ~ AuthService ~ updateUser:", updateUser);

		await sendEmail({
			to: email,
			subject: "Password Reset OTP",
			text: `Your OTP for password reset is: ${otp}`,
			html: `<h1>Password Reset OTP</h1><p>Your OTP for password reset is: <strong>${otp}</strong></p>`,
		});

		res.status(200).json({
			message: "OTP sent to your email",
			data: { userId: user._id, name: user.name, email: user.email, otp }, // Remove otp in production
		});
	};

	// Reset Password
	public resetPassword = async (
		req: Request<{}, {}, ResetPasswordBody>,
		res: Response,
		next: NextFunction
	) => {
		const { email, otp, newPassword } = req.body;

		const user = await this.userModel.findOne({
			filter: { email, otp: { $exists: true } },
		});

		if (!user) {
			throw new ApplicationError(404, "User not found");
		}

		const isOtpValid = compareHash({
			plainText: otp || "",
			hash: user.otp,
		});

		if (!isOtpValid) {
			throw new ApplicationError(400, "Invalid OTP");
		}

		const hashedPassword = generateHash({ plainText: newPassword });

		await this.userModel.update({
			filter: { email },
			update: { password: hashedPassword, $unset: { otp: 1 } } as any,
		});

		res.status(200).json({
			message: "Password reset successfully",
			data: { userId: user._id, name: user.name, email: user.email },
		});
	};

	// Logout
	public logout = async (
		req: AuthenticatedRequest & { body: LogoutBody },
		res: Response,
		next: NextFunction
	) => {
		const { flag } = req.body;
		let status = 200;

		switch (flag) {
			case "all":
				await this.userModel.update({
					filter: { _id: req.user!.id },
					update: { $set: { changeCredentialTime: new Date() } } as any,
				});
				break;

			default:
				const oneYearInSeconds = 60 * 60 * 24 * 365;
				const expireIn = new Date((req.user!.iat + oneYearInSeconds) * 1000);
				await this.tokenModel.createToken({
					data: [
						{
							jwtId: req.user!.jti,
							expireIn,
							userId: new mongoose.Types.ObjectId(req.user!.id),
						},
					],
				});
				status = 201;
				break;
		}

		res.status(status).json({ message: "User logged out successfully" });
	};
}
export default new AuthService();
