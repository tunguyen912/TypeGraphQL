import { User } from "../user/userModel";

export interface ICommentPayload {
    _id: string;
    owner: User;
    content: string;
    createdAt: Date;
}