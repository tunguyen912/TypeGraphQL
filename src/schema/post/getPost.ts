import { Arg, Field, InputType, Query, Resolver } from "type-graphql";
import { getAllPostController, getPostByIdController, getPostByOwnerIdController } from "../../controllers/post/postController";
import { Post } from "../schema";

@InputType()
class paginationInput{
    @Field({ nullable: true })
    limit?: number

    @Field({ nullable: true })
    cursor?: string
}

@Resolver()
export class GetPostResolver{
    @Query(() => [Post])
    async getAllPost(
        @Arg('paginationInput', { nullable: true }) paginationInput: paginationInput
    ): Promise<Post[]> {
        if(paginationInput){
            const { limit, cursor } = paginationInput
            return await getAllPostController(limit, cursor);
        }
        return await getAllPostController();
    }
    @Query(() => Post)
    async getPostById(
        @Arg('postId') postId: string,
    ): Promise<Post> {
        return await getPostByIdController(postId);
    }
    @Query(() => [Post])
    async getPostByOwnerId(
        @Arg('ownerId') ownerId: string,
        @Arg('paginationInput', { nullable: true }) paginationInput: paginationInput
    ): Promise<Post[]>{
        if(paginationInput){
            const { limit, cursor } = paginationInput
            return await getPostByOwnerIdController(ownerId, limit, cursor);
        }
        return await getPostByOwnerIdController(ownerId);
    }
}