import { User } from "../user/userModel";

export interface ILikePostPayload {
    userLike: User;
    content: string;
    likes: number;
    owner: User;
}