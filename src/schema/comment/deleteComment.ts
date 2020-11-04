import { Arg, Field, InputType, Mutation, ObjectType, Resolver, UseMiddleware } from "type-graphql";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";
import { deleteCommentController } from "../../controllers/comment/commentController"

@ObjectType()
class DeleteCommentResponse{
    @Field()
    isSuccess: boolean;

    @Field({nullable: true})
    message?: string;
}

@InputType()
class DeleteCommentData{
    @Field()
    commentID: string

    @Field()
    postID: string
}

@Resolver()
export class DeleteCommentResolver{
    @UseMiddleware(isAuthenticated)
    @Mutation(() => DeleteCommentResponse)
    async deleteComment(
        @Arg('data') deleteCommentData: DeleteCommentData,
    ): Promise<DeleteCommentResponse> {
        const { commentID, postID } = deleteCommentData;
        const response = await deleteCommentController(commentID, postID);
        return response;
    }
    
}