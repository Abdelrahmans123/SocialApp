// src/utils/crypto.ts
import bcrypt from "bcryptjs";
import CryptoJS from "crypto-js";

interface HashOptions {
	plainText?: string;
	salt?: number;
}

interface CompareOptions {
	plainText?: string;
	hash?: string;
}

interface EncryptOptions {
	plainText?: string;
	secretKey?: string;
}

interface DecryptOptions {
	cipherText?: string;
	secretKey?: string;
}


export const generateHash = ({
	plainText = "",
	salt = 8,
}: HashOptions = {}): string => {
	return bcrypt.hashSync(plainText, salt);
};


export const compareHash = ({
	plainText = "",
	hash = "",
}: CompareOptions = {}): boolean => {
	return bcrypt.compareSync(plainText, hash);
};

export const encrypt = ({
	plainText = "",
	secretKey = "",
}: EncryptOptions = {}): string => {
	return CryptoJS.AES.encrypt(plainText, secretKey).toString();
};


export const decrypt = ({
	cipherText = "",
	secretKey = "",
}: DecryptOptions = {}): string => {
	const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
	return bytes.toString(CryptoJS.enc.Utf8);
};
