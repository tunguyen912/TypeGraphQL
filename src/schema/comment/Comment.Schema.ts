import { Arg, Ctx, Mutation, PubSubEngine, Resolver, UseMiddleware, PubSub, Subscription, Root } from "type-graphql";
// Controllers
import { addCommentController, deleteCommentController, updateCommentController } from "../../controllers/Comment.Controller";
// Middlewares
import { authorizationMiddleware } from "../../middlewares/authorizationMiddleware";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";

import { Context } from "../../model/types/Context";
import { ICommentPayload, IPostPayload } from "../../model/types/IPayload.model";
import { ADD_COMMENT_TOPIC, DELETE_COMMENT_TOPIC, UPDATE_COMMENT_TOPIC } from "../../utils/constants/Comment.Constants";
import { CommentDataResponse, Post } from "../schema";
import { commentData, CommentResponse, DeleteCommentData, DeleteCommentResponse, UpdateCommentData } from "./Comment.Type";

@Resolver()
export class CommentResolver{
    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    // Mutation
    @Mutation(() => CommentResponse)
    async addComment(
        @Arg('data') commentData: commentData,
        @Ctx() context: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<CommentResponse> {
        const { data, response } =  await addCommentController(commentData, context);
        // const owner = await findUserByIdController(updatedPost.owner);
        if(data){
            const payload: ICommentPayload = data;
            pubSub.publish(ADD_COMMENT_TOPIC, payload);
        }
        return response;
    }

    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    @Mutation(() => DeleteCommentResponse)
    async deleteComment(
        @Arg('data') deleteCommentData: DeleteCommentData,
        @Ctx() context: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<DeleteCommentResponse> {
        const { commentID, postID } = deleteCommentData;
        const { data, response } = await deleteCommentController(commentID, postID, context);
        
        if(data){
            // moi sua
            const payload: IPostPayload = data;
            pubSub.publish(DELETE_COMMENT_TOPIC, payload);
        }
        return response;
    }

    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    @Mutation(() => CommentResponse)
    async updateComment(
        @Arg('data') updateCommentData: UpdateCommentData,
        @Ctx() context: Context,
        @PubSub() pubSub: PubSubEngine,
    ): Promise<CommentResponse> {
        const { commentID, newCommentContent, postID } = updateCommentData;
        const { data, response } = await updateCommentController(commentID, postID, newCommentContent, context);
        if(data){
            const payload: ICommentPayload = data
            pubSub.publish(UPDATE_COMMENT_TOPIC, payload);
        }
        return response;
    }
    // Subscription
    @Subscription(() => CommentDataResponse, {
        topics: ADD_COMMENT_TOPIC,
    })
    commentSub(
        @Root() payload: ICommentPayload,
    ): CommentDataResponse{
        return payload;
    }

    @Subscription(() => Post, {
        topics: DELETE_COMMENT_TOPIC,
    })
    deleteCommentSub(
        @Root() payload: IPostPayload,
    ): Post{
        return payload;
    }

    @Subscription(() => CommentDataResponse, {
        topics: UPDATE_COMMENT_TOPIC,
    })
    updateCommentSub(
        @Root() payload: ICommentPayload,
    ): CommentDataResponse{
        return payload;
    }
}