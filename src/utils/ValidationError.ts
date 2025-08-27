import ApplicationError from "./ApplicationError";

class ValidationError extends ApplicationError {
	constructor(
		public override status: number,
		public override message: string,
		public override stack: string = new Error().stack || "",
		public field: string,
		public errors: Array<{ field: string; errors: string[] }>,
		public override cause?: string
	) {
		super(status, message);
		this.name = "ValidationError";
		Error.captureStackTrace(this, this.constructor);
	}
}

export default ValidationError;
