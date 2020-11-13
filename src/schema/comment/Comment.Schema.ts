import { Arg, Ctx, Mutation, PubSubEngine, Resolver, UseMiddleware, PubSub, Subscription, Root } from "type-graphql";
// Controllers
import CommentController from "../../controllers/Comment.Controller";
// Middlewares
import { authorizationMiddleware } from "../../middlewares/authorizationMiddleware";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";

import { Context } from "../../model/types/Context";
import { ICommentPayload, IPostPayload } from "../../model/types/IPayload.model";
import { ADD_COMMENT_TOPIC, DELETE_COMMENT_TOPIC, UPDATE_COMMENT_TOPIC } from "../../utils/constants/Comment.Constants";
import { CommentDataResponse, Post, DefaultResponse } from "../schema";
import { commentData, CommentNotiResponse, DeleteCommentData, UpdateCommentData } from "./Comment.Type";

@Resolver()
export class CommentResolver{
    // Mutation
    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    @Mutation(() => DefaultResponse)
    async addComment(
        @Arg('data') commentData: commentData,
        @Ctx() context: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<DefaultResponse> {
        const { data, response } =  await CommentController.addCommentController(commentData, context);
        if(data){
            const payload: ICommentPayload = data
            pubSub.publish(ADD_COMMENT_TOPIC, payload);
        }
        return response;
    }

    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    @Mutation(() => DefaultResponse)
    async deleteComment(
        @Arg('data') deleteCommentData: DeleteCommentData,
        @Ctx() context: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<DefaultResponse> {
        const { commentID, postID } = deleteCommentData;
        const { data, response } = await CommentController.deleteCommentController(commentID, postID, context);
        if(data){
            const payload: IPostPayload = data;
            pubSub.publish(DELETE_COMMENT_TOPIC, payload);
        }
        return response;
    }

    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    @Mutation(() => DefaultResponse)
    async updateComment(
        @Arg('data') updateCommentData: UpdateCommentData,
        @Ctx() context: Context,
        @PubSub() pubSub: PubSubEngine,
    ): Promise<DefaultResponse> {
        const { commentID, newCommentContent, postID } = updateCommentData;
        const { data, response } = await CommentController.updateCommentController(commentID, postID, newCommentContent, context);
        if(data){
            const payload: ICommentPayload = data;
            pubSub.publish(UPDATE_COMMENT_TOPIC, payload);
        }
        return response;
    }
    // Subscription
    @Subscription(() => CommentDataResponse, { topics: ADD_COMMENT_TOPIC })
    commentSub(
        @Root() payload: ICommentPayload,
    ): CommentDataResponse{
        return payload;
    }

    @Subscription(() => CommentNotiResponse, {
        topics: ADD_COMMENT_TOPIC,
        filter: ({ payload, args }) => {
            return payload.toPost.owner.email === args.owner
        }
    })
    commentNotiSub(
        @Root() payload,
        @Arg('owner') owner: string
    ): CommentNotiResponse{
        return { userComment: payload.owner, postID: payload.toPost._id };
    }

    @Subscription(() => Post, { topics: DELETE_COMMENT_TOPIC })
    deleteCommentSub(
        @Root() payload: IPostPayload,
    ): Post{
        return payload;
    }

    @Subscription(() => CommentDataResponse, { topics: UPDATE_COMMENT_TOPIC })
    updateCommentSub(
        @Root() payload: ICommentPayload,
    ): CommentDataResponse{
        return payload;
    }
}