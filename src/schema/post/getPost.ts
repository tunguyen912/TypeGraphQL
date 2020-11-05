import { Arg, Field, ObjectType, Query, Resolver } from "type-graphql";
import { getAllPostController, getPostByIdController, getPostByOwnerIdController } from "../../controllers/post/postController";
import { CommentDataResponse } from '../schema'
import { User } from "../schema";

@ObjectType()
export class Post{
    @Field()
    _id: string;

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

    @Field(() => [CommentDataResponse])
    listOfComment: CommentDataResponse[];
}
@Resolver()
export class GetPostResolver{
    @Query(() => [Post])
    async getAllPost(): Promise<Post[]> {
        const result = await getAllPostController();
        return result as unknown as Array<Post>;
    }
    @Query(() => Post)
    async getPostById(
        @Arg('postId') postId: string
    ): Promise<Post> {
        return await getPostByIdController(postId);
    }
    @Query(() => [Post])
    async getPostByOwnerId(
        @Arg('ownerId') ownerId: string
    ): Promise<Post[]>{
        return await getPostByOwnerIdController(ownerId) as unknown as Array<Post>;
    }
}