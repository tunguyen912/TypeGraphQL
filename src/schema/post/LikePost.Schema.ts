import { Arg, Ctx, Mutation, Resolver, PubSub, PubSubEngine, UseMiddleware, Subscription, Root, Query } from "type-graphql";
import redisClient from "../../config/Redis.Config";
// Controllers
import PostController from "../../controllers/Post.Controller";
import UserController from "../../controllers/User.Controllers";
// Middlewares
import { authorizationMiddleware } from "../../middlewares/authorizationMiddleware";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";
// Models
import { Context } from "../../model/types/Context";
import { ILikePostPayload, IUserPayload } from "../../model/types/IPayload.model";
import { User, DefaultResponse } from "../schema";
// Utils
import { LIKE_POST_TOPIC } from "../../utils/constants/Post.Constants"
import SecureUtil from "../../utils/Secure.utils";
import { LikeSubResponse } from "./Post.Type";

@Resolver()
export class LikeResolver{
    // Query
    @UseMiddleware(isAuthenticated)
    @Query(() => [User])
    async getListOfLikes(
        @Arg('postID') postID: string,
    ): Promise<User[]> {
        const result = await PostController.getListOfLikesController(postID);
        return result as unknown as Array<User>;
    }
    // Mutation
    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    @Mutation(() => DefaultResponse)
    async likePost(
        @Arg('postID') postID: string,
        @Ctx() context: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<DefaultResponse> {
        const { data, response } = await PostController.likePostController(postID, context);
        const clientDeviceID: string = SecureUtil.getUserClientId(context.req);
        const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
        const userLike = await UserController.findUserController(userInfo.email);
        if(data){
            const owner = await UserController.findUserController(data.owner.email);
            const payload: ILikePostPayload = {
                userLike,
                _id: data._id,
                likes: data.likes,
                owner
            }
            pubSub.publish(LIKE_POST_TOPIC, payload );
        }
        return response;
    }
    // Subscription
    @Subscription(() => LikeSubResponse, {
        topics: LIKE_POST_TOPIC,
        // filter: ({ payload, args }) => {
        //     return payload.data.owner.email === args.owner && payload.isLike
        //     return payload.data.owner.email === args.owner 
        // }
    })
    likePostSub(
        @Root() payload: ILikePostPayload,
        // @Arg('owner') owner: string,
    ): LikeSubResponse{
        return payload;
    }
}