import { User } from "../user/userModel";

export interface ICommentPayload {
    owner: User;
    content: string;
    createdAt: Date
}