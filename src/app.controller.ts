import { config } from "dotenv";
import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import type { Express, NextFunction, Request, Response } from "express";
import { router as authRoutes } from "./modules/Auth";
import { router as userRoutes } from "./modules/User";
import { router as postRoutes } from "./modules/Post";
import IError from "./utils/Error";
import ValidationError from "./utils/ValidationError";
import connectDB from "./DB/connection.db";
const envPath: string = path.resolve("./config/.env");
config({ path: envPath });

const bootstrap = (): void => {
	const port: number | string = process.env.PORT || 3000;
	const app: Express = express();
	app.use(express.json());
	app.use(cors());
	app.use(helmet());
	app.use(
		rateLimit({
			windowMs: 15 * 60 * 1000,
			limit: 2000,
			message: "Too many requests from this IP, please try again later.",
		})
	);
	connectDB();
	app.use("/api/auth", authRoutes);
	app.use("/api/users", userRoutes);
	app.use("/api/posts", postRoutes);
	app.all("{/*dummy}", (req: Request, res: Response): Response => {
		return res.status(404).json({ message: "Route Not Found" });
	});
	app.use(
		(
			error: IError,
			req: Request,
			res: Response,
			next: NextFunction
		): Response => {
			if (error instanceof ValidationError) {
				return res.status(error.status || 400).json({
					errors: error,
				});
			}
			return res.status(error.status || 500).json({
				message: error.message || "Internal Server Error",
				stack: error.stack,
				cause: error.cause,
			});
		}
	);
	app.listen(port, () => {
		console.log(`Server is running on ${port}`);
	});
};
export default bootstrap;
