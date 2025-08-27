import { NextFunction, Request, Response } from "express";
import zod from "zod";
import ValidationError from "../utils/ValidationError";
type KeyReqType = keyof Request;
type SchemaType = Partial<Record<KeyReqType, zod.ZodSchema>>;
export const validate = (schema: SchemaType) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		const issues: Array<{ field: string; errors: string[] }> = [];

		for (const key of Object.keys(schema) as KeyReqType[]) {
			if (!schema[key]) continue;
			const validationResult = schema[key]?.safeParse(req[key]);
			if (!validationResult.success) {
				const error = validationResult.error as zod.ZodError;
				issues.push({
					field: String(key),
					errors: error.issues.map((issue) => issue.message),
				});
			}
		}

		if (issues.length > 0) {
			throw new ValidationError(
				400,
				"Validation Error",
				"",
				issues.map((issue) => issue.field).join(", "),
				issues
			);
		}

		next();
	};
};
