interface IError extends Error {
	status: number;
	stack: string;
	message: string;
	cause?: string;
}
export default IError;
