import mongoose from "mongoose";

let isConnected = false; // global flag

async function connectDB(): Promise<void> {
	if (isConnected) return;

	try {
		await mongoose.connect(process.env.MONGODB_URI as string, {
			serverSelectionTimeoutMS: 10000,
		});
		console.log("✅ MongoDB connected");
	} catch (error) {
		if (error instanceof Error) {
			console.error("❌ MongoDB connection error:", error.message);
		} else {
			console.error("❌ MongoDB connection error:", error);
		}
		throw error;
	}
}

export default connectDB;
