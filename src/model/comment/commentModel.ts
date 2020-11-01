import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { User } from "../user/userModel";

export class Comment {
    @prop({ required: true, ref: 'User' })
    owner: Ref<User>;

    @prop({ required: true })
    content: string

    @prop({ default: Date.now })
    createdAt: Date
}
export const CommentModel = getModelForClass(Comment);
