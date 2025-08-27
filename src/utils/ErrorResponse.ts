import { Request, Response } from "express";
import IError from "./Error";

export const globalErrorHandler = (
	error: IError,
	req: Request,
	res: Response
): Response => {
	return res.status(error.status || 500).json({
		message: error.message || "Internal Server Error",
		stack: error.stack,
	});
};
