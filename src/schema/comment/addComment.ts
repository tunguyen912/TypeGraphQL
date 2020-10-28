import { Arg, Ctx, Field, InputType, Mutation, ObjectType, PubSubEngine, Resolver, UseMiddleware, PubSub, Subscription, Root } from "type-graphql";
import { addCommentController } from "../../controllers/comment/commentController";
import { findUserByIdController } from "../../controllers/user/userControllers";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";
import { Context } from "../../model/types/Context";
import { ICommentPayload } from "../../model/types/ICommentPayload.model";
import { ADD_COMMENT_TOPIC } from "../../utils/constants/postConstants";
import { User } from "../user/loginSchema";

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

@ObjectType()
class CommentSubResponse{
    @Field()
    user: User;

    @Field()
    content: string;

}

@Resolver()
export class CommentResolver{
    @UseMiddleware(isAuthenticated)
    @Mutation(() => CommentResponse)
    async addComment(
        @Arg('data') commentData: commentData,
        @Ctx() context: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<CommentResponse> {
        const { comment, updatedPost, response } =  await addCommentController(commentData, context);
        const owner = await findUserByIdController(updatedPost.userID);
        const payload: ICommentPayload = {
            content: comment.content,
            user: comment.userID
        }
        pubSub.publish(ADD_COMMENT_TOPIC, {data: payload, owner});
        return response
    }
    @Subscription(() => CommentSubResponse, {
        topics: ADD_COMMENT_TOPIC,
        filter: ({ payload, args }) => {
            return payload.owner.email === args.owner
        }
    })
    commentSub(
        @Root() payload,
        @Arg('owner') owner: string
    ): CommentSubResponse{
        return payload.data;
    }
}