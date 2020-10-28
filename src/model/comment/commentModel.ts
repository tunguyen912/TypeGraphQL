import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { User } from "../user/userModel";

export class Comment {
    @prop({ required: true, ref: 'User' })
    userID: Ref<User>;

    @prop({ required: true })
    content: string

    @prop({ default: Date.now })
    time: Date
}
export const CommentModel = getModelForClass(Comment);
