import { ICommentPayload } from "./ICommentPayload.model";
import { User } from "../user/userModel";

export interface IPostPayload {
    _id: string;
    owner: User;
    content: string;
    likes: number;
    listOfLike: User[];
    createdAt: Date;
    comments: number; 
    listOfComment: ICommentPayload[];
}