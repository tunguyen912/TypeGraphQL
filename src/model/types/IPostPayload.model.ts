import { User } from "../user/userModel";

export interface IPostPayload {
    userLike: User;
    owner: User;
    content: string;
    likes: number;
}