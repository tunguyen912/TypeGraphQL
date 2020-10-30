import { User } from "../user/userModel";

export interface IMessagePayload {
    messageFrom: User,
    messageTo: User,
    messageContent: string,
    conversationID: string,
    createdAt: Date
}