import type { Request, Response } from "express";
import type { IRegisterData } from "./auth.dto";
import { sendEmail } from "../../utils/sendEmail";
import User, { IUser, IUserDocument } from "../../DB/model/User.model";
import { compareHash, encrypt, generateHash } from "../../utils/security";
import { findOne, create, update } from "../../DB/services/DBService";
import { customAlphabet, nanoid } from "nanoid";
import ApplicationError from "../../utils/ApplicationError";
import { generateJWT } from "../../utils/jwt";

class AuthService {
	constructor() {
		// Initialize any necessary properties or dependencies
	}
	public register = async (req: Request, res: Response): Promise<Response> => {
		const { name, password, email, phone, gender, role } =
			req.body as IRegisterData;

		const existingUser = await findOne<IUser>(User, { email });
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

		const newUser = await create(User, {
			name,
			password: hashedPassword,
			email,
			phone: encryptPhone,
			gender,
			otp: otpHash,
			role,
		});

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
		const { email, password } = req.body as { email: string; password: string };

		const user: IUserDocument | null = await User.findOne({ email });
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

		const accessToken = generateJWT(user, "3000s", jwtId);
		const refreshToken = generateJWT(user, "1d", jwtId);

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

		const user = await findOne<IUser>(User, {
			email,
			confirmEmail: { $exists: false },
			otp: { $exists: true },
		});
		if (!user) {
			throw new ApplicationError(404, "User not found");
		}

		const isOtpValid = compareHash({ plainText: otp, hash: user.otp });
		if (!isOtpValid) {
			throw new ApplicationError(400, "Invalid OTP");
		}

		await update(User, { email }, { confirmEmail: new Date(), otp: null });

		return res.status(200).json({
			message: "Email confirmed successfully",
			data: { userId: user._id, name: user.name, email: user.email },
		});
	};
}
export default new AuthService();
