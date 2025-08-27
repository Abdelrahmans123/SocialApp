import nodemailer, { Transporter } from "nodemailer";

interface SendEmailOptions {
	to: string | string[];
	subject: string;
	text?: string;
	html?: string;
}

export const sendEmail = async ({
	to,
	subject,
	text,
	html,
}: SendEmailOptions): Promise<void> => {
	if (!process.env.APP_EMAIL || !process.env.APP_PASSWORD) {
		throw new Error("Email credentials are not set in environment variables");
	}

	const transporter: Transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.APP_EMAIL,
			pass: process.env.APP_PASSWORD,
		},
	});

	const mailOptions = {
		from: process.env.APP_EMAIL,
		to,
		subject,
		text,
		html,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log("✅ Email sent successfully");
	} catch (error) {
		console.error("❌ Error sending email:", error);
		throw new Error("Failed to send email");
	}
};
