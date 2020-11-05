import { Arg, Query, Resolver } from "type-graphql";
import { getAllPostController, getPostByIdController, getPostByOwnerIdController } from "../../controllers/post/postController";
import { Post } from "../schema";


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