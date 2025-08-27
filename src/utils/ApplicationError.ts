class ApplicationError extends Error {
	constructor(
		public status: number,
		public override message: string,
		public override stack: string = new Error().stack || "",
		public override cause?: string
	) {
		super(message);
		this.name = "ApplicationError";
		Error.captureStackTrace(this, this.constructor);
	}
}

export default ApplicationError;
