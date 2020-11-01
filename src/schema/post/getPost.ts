import { Field, ObjectType, Query, Resolver } from "type-graphql";
import { getAllPostController } from "../../controllers/post/postController";
import { CommentSubResponse } from '../schema'
import { User } from "../schema";

@ObjectType()
class Post{
    @Field(() => User)
    owner: User;

    @Field()
    content: string;

    @Field()
    likes: number;

    @Field(() => [User])
    listOfLike: User[];

    @Field()
    createdAt: Date;

    @Field()
    comments: number; 

    @Field(() => [CommentSubResponse])
    listOfComment: CommentSubResponse[];
}
@Resolver()
export class GetPostResolver{
    @Query(() => [Post])
    async getAllPost(): Promise<Post[]> {
        const result = await getAllPostController();
        return result as unknown as Array<Post>;
    }
}