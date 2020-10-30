import { User } from "../user/userModel";

export interface ILikePostPayload {
    userLike: User;
    owner: User;
    content: string;
    likes: number;
    createdAt: Date;
}