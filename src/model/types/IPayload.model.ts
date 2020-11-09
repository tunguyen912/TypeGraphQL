import { User } from "../User.Model";

export interface IUserPayload {
    _id?: string
    email: string,
    firstName: string,
    lastName: string,
    token?: string
}

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

export interface IMessagePayload {
    _id: string,
    messageFrom: User,
    messageTo: User,
    messageContent: string,
    conversationID: string,
    createdAt: Date
}

export interface ILikePostPayload {
    userLike: User;
    likes: number;
    owner: User;
    _id: String;
}

export interface ICommentPayload {
    _id: string;
    owner: User;
    content: string;
    createdAt: Date;
}