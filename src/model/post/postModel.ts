import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { User } from "../user/userModel";

export class Post {
    @prop({ required: true, ref: 'User' })
    userID: Ref<User>;

    @prop({ required: true })
    content: string

    @prop({ default: 0 })
    likes: number

    @prop({ ref: 'User', default: [] })
    listOfLike: Ref<User>[]
}
export const PostModel = getModelForClass(Post);
