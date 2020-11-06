import { Arg, Ctx, Field, InputType, Mutation, ObjectType, PubSubEngine, Resolver, UseMiddleware, PubSub, Subscription, Root } from "type-graphql";
// Controllers
import { addCommentController } from "../../controllers/comment/commentController";
// Middlewares
import { authorizationMiddleware } from "../../middlewares/authorizationMiddleware";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";

import { Context } from "../../model/types/Context";
import { ICommentPayload } from "../../model/types/ICommentPayload.model";
import { ADD_COMMENT_TOPIC } from "../../utils/constants/postConstants";
import { CommentDataResponse } from "../schema";

@InputType()
export class commentData{
    @Field()
    commentContent: string

    @Field()
    postID: string
}

@ObjectType()
class CommentResponse{
    @Field()
    isSuccess: boolean;

    @Field({nullable: true})
    message?: string;
}

@Resolver()
export class CommentResolver{
    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    @Mutation(() => CommentResponse)
    async addComment(
        @Arg('data') commentData: commentData,
        @Ctx() context: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<CommentResponse> {
        const { comment, response } =  await addCommentController(commentData, context);
        // const owner = await findUserByIdController(updatedPost.owner);
        const payload: ICommentPayload = {
            _id: comment._id,
            content: comment.content,
            owner: comment.owner,
            createdAt: comment.createdAt
        }
        // pubSub.publish(ADD_COMMENT_TOPIC, {data: payload, owner});
        pubSub.publish(ADD_COMMENT_TOPIC, payload);
        return response;
    }
    @Subscription(() => CommentDataResponse, {
        topics: ADD_COMMENT_TOPIC,
        // filter: ({ payload, args }) => {
        //     return payload.owner.email === args.owner
        // }
    })
    commentSub(
        @Root() payload,
        // @Arg('owner') owner: string
    ): CommentDataResponse{
        return payload;
    }
}