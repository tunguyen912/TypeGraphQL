import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { Comment } from "../comment/commentModel";
import { User } from "../user/userModel";

export class Post {
    @prop({ required: true, ref: 'User' })
    owner: Ref<User>;

    @prop({ required: true })
    content: string

    @prop({ default: 0 })
    likes: number

    @prop({ ref: 'User', default: [] })
    listOfLike: Ref<User>[]

    @prop({ default: 0 })
    comments: number

    @prop({ ref: 'Comment', default: [] })
    listOfComment: Ref<Comment>[]

    @prop({ default: Date.now })
    createdAt: Date
}
export const PostModel = getModelForClass(Post);
