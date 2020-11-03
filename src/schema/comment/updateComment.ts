import { Arg, Field, InputType, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";
import { CommentDataResponse } from "../schema";
import { updateCommentController } from "../../controllers/comment/commentController"

@InputType()
class UpdateCommentData{
    @Field()
    commentID: string

    @Field()
    newCommentContent: string
}

@Resolver()
export class UpdateCommentResolver{
    @UseMiddleware(isAuthenticated)
    @Mutation(() => CommentDataResponse)
    async updateComment(
        @Arg('data') updateCommentData: UpdateCommentData,
    ): Promise<CommentDataResponse> {
        const { commentID, newCommentContent } = updateCommentData;
        const newComment = await updateCommentController(commentID, newCommentContent);
        return newComment;
    }
}