import { CreateOptions, Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import ApplicationError from "../../utils/ApplicationError";
import { IToken } from "../model/Token.model";

export class TokenRepository extends DatabaseRepository<IToken> {
    constructor(protected override readonly model: Model<IToken>) {
        super(model);
    }
    async createToken({
        data,
        options,
    }: {
        data: Partial<IToken>[];
        options?: CreateOptions;
    }): Promise<IToken[] | undefined> {
        const tokens = await this.create({ data, ...(options && { options }) });
        if (!tokens) {
            throw new ApplicationError(500, "Token creation failed");
        }
        return tokens;
    }
}
