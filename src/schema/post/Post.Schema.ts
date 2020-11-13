import { Arg, Ctx, Mutation, PubSub, PubSubEngine, Query, Resolver, Root, Subscription, UseMiddleware } from "type-graphql";
import PostController from "../../controllers/Post.Controller";

// Middlewares
import { authorizationMiddleware } from "../../middlewares/authorizationMiddleware";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";

import { Context } from "../../model/types/Context";
import { IPostPayload } from "../../model/types/IPayload.model";
import { CREATE_POST_TOPIC, UPDATE_POST_TOPIC } from "../../utils/constants/Post.Constants";
import { GetPostListResponse, paginationInput, postData, UpdatePostData } from "./Post.Type";
import { Post, DefaultResponse } from "../schema";


@Resolver()
export class PostResolver{
    // Query
    @Query(() => GetPostListResponse)
    async getAllPost(
        @Arg('paginationInput') paginationInput: paginationInput
    ): Promise<GetPostListResponse> {
        const { limit, cursor } = paginationInput;
        if(cursor){
            const data = await PostController.getAllPostController(limit, cursor);
            const totalPost = await PostController.getPostNumber();
            return { data, totalPost }
        }
        const data = await PostController.getAllPostController(limit);
        const totalPost = await PostController.getPostNumber();
        return { data, totalPost }
    }

    @Query(() => Post)
    async getPostById(
        @Arg('postId') postId: string,
    ): Promise<Post> {
        return await PostController.getPostByIdController(postId);
    }
    @Query(() => GetPostListResponse)
    async getPostByOwnerId(
        @Arg('ownerId') ownerId: string,
        @Arg('paginationInput') paginationInput: paginationInput
    ): Promise<GetPostListResponse>{
        const { limit, cursor } = paginationInput;
        if(cursor){
            const data = await PostController.getPostByOwnerIdController(ownerId, limit, cursor);
            const totalPost = await PostController.getPostNumber(ownerId);
            return { data, totalPost } 
        }
        const data = await PostController.getPostByOwnerIdController(ownerId, limit);
        const totalPost = await PostController.getPostNumber(ownerId);
        return { data, totalPost }     
    }
    // Mutation
    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    @Mutation(() => DefaultResponse)
    async createPost(
        @Arg('data') postData: postData,
        @PubSub() pubSub: PubSubEngine,
        @Ctx() context: Context,
    ): Promise<DefaultResponse> {
        const { data, response } = await PostController.createPostController(postData, context);
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
    @Mutation(() => DefaultResponse)
    async deletePost(
        @Arg('postID') postID: string,
        @Ctx() context: Context
    ): Promise<DefaultResponse> {
       return await PostController.deletePostController(postID, context);
    }
    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    @Mutation(() => DefaultResponse)
    async updatePost(
        @Arg('data') updatePostData: UpdatePostData,
        @Ctx() context: Context,
        @PubSub() pubSub: PubSubEngine,
    ): Promise<DefaultResponse> {
        const { postID, newPostContent } = updatePostData;
        const { data, response } = await PostController.updatePostController(postID, newPostContent, context);
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
    @Subscription(() => Post, { topics: CREATE_POST_TOPIC })
    createPostSub(
        @Root() payload: IPostPayload,
    ): Post{
        return payload;
    }

    @Subscription(() => Post, { topics: UPDATE_POST_TOPIC })
    updatePostSub(
        @Root() payload: IPostPayload,
    ): Post{
        return payload;
    }
}