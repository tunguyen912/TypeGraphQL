import { Arg, Field, Mutation, ObjectType } from "type-graphql";
import { deletePostController } from "../../controllers/post/postController";

@ObjectType()
class DeletePostResponse{
    @Field()
    isSuccess: boolean;

    @Field({nullable: true})
    message?: string;
}

export class DeletePostResolver {
    @Mutation(() => DeletePostResponse)
    async deletePost(
        @Arg('postID') postID: string
    ): Promise<DeletePostResponse> {
       return await deletePostController(postID);
    }
}