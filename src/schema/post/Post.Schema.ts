import { Arg, Ctx, Mutation, PubSub, PubSubEngine, Query, Resolver, Root, Subscription, UseMiddleware } from "type-graphql";
import { getAllPostController, getPostByIdController, getPostByOwnerIdController, createPostController, deletePostController, updatePostController } from "../../controllers/Post.Controller";

import { Post } from "../schema";
// Middlewares
import { authorizationMiddleware } from "../../middlewares/authorizationMiddleware";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";

import { Context } from "../../model/types/Context";
import { IPostPayload } from "../../model/types/IPayload.model";
import { CREATE_POST_TOPIC, UPDATE_POST_TOPIC } from "../../utils/constants/Post.Constants";
import { paginationInput, postData, PostResponse, UpdatePostData } from "./Post.Type";

@Resolver()
export class PostResolver{
    // Query
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
            const { limit, cursor } = paginationInput;
            return await getPostByOwnerIdController(ownerId, limit, cursor);
        }
        return await getPostByOwnerIdController(ownerId);
    }
    // Mutation
    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    @Mutation(() => PostResponse)
    async createPost(
        @Arg('data') postData: postData,
        @PubSub() pubSub: PubSubEngine,
        @Ctx() context: Context,
    ): Promise<PostResponse> {
        const { data, response } = await createPostController(postData, context);
        if(data){
            const payload: IPostPayload = {
                _id: data._id,
                owner: data.owner,
                content: data.content,
                likes: data.likes,
                listOfLike: data.listOfLike,
                createdAt: data.createdAt,
                comments: data.comments, 
                listOfComment: data.listOfComment,
            }
            pubSub.publish(CREATE_POST_TOPIC, payload);
        }
        return response;
    }
    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    @Mutation(() => PostResponse)
    async deletePost(
        @Arg('postID') postID: string,
        @Ctx() context: Context
    ): Promise<PostResponse> {
       return await deletePostController(postID, context);
    }
    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    @Mutation(() => PostResponse)
    async updatePost(
        @Arg('data') updatePostData: UpdatePostData,
        @Ctx() context: Context,
        @PubSub() pubSub: PubSubEngine,
    ): Promise<PostResponse> {
        const { postID, newPostContent } = updatePostData;
        const { data, response } = await updatePostController(postID, newPostContent, context);
        if(data){
            const payload: IPostPayload = {
                _id: data._id,
                owner: data.owner,
                content: data.content,
                likes: data.likes,
                listOfLike: data.listOfLike,
                createdAt: data.createdAt,
                comments: data.comments, 
                listOfComment: data.listOfComment,
            }
            pubSub.publish(UPDATE_POST_TOPIC,  payload);
        }
        return response;
    }
    // Subscription
    @Subscription(() => Post, {
        topics: CREATE_POST_TOPIC,
    })
    createPostSub(
        @Root() payload: IPostPayload,
    ): Post{
        return payload;
    }

    @Subscription(() => Post, {
        topics: UPDATE_POST_TOPIC,
    })
    updatePostSub(
        @Root() payload: IPostPayload,
    ): Post{
        return payload;
    }
}