import { User } from "../user/userModel";

export interface ICommentPayload {
    user: User;
    content: string;
    createdAt: Date
}