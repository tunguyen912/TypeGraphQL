import { Arg, Ctx, Field, InputType, Mutation, Resolver, UseMiddleware, PubSub, PubSubEngine, Subscription, Root } from "type-graphql";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";
import { CommentDataResponse } from "../schema";
import { updateCommentController } from "../../controllers/comment/commentController"
import { Context } from "../../model/types/Context";
import { ICommentPayload } from "../../model/types/ICommentPayload.model";
import { UPDATE_COMMENT_TOPIC } from "../../utils/constants/commentConstants";

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
        @Ctx() context: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<CommentDataResponse> {
        const { commentID, newCommentContent } = updateCommentData;
        const newComment = await updateCommentController(commentID, newCommentContent);
        const payload: ICommentPayload = {
            content: newComment.content,
            owner: newComment.owner,
            createdAt: newComment.createdAt
        }
        pubSub.publish(UPDATE_COMMENT_TOPIC, payload);
        return newComment;
        //response??
    }
    @Subscription(() => CommentDataResponse, {
        topics: UPDATE_COMMENT_TOPIC,
    })
    updateCommentSub(
        @Root() payload,
    ): CommentDataResponse{
        return payload;
    }
}