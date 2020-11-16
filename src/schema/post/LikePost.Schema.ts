import { Arg, Ctx, Field, Mutation, ObjectType, Resolver, PubSub, PubSubEngine, UseMiddleware, Subscription, Root, Query } from "type-graphql";
import redisClient from "../../config/Redis.Config";
// Controllers
import { getListOfLikesController, likePostController } from "../../controllers/Post.Controller";
import { findUserController } from "../../controllers/User.Controllers";
// Middlewares
import { authorizationMiddleware } from "../../middlewares/authorizationMiddleware";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";
// Models
import { Context } from "../../model/types/Context";
import { ILikePostPayload, IUserPayload } from "../../model/types/IPayload.model";
import { User } from "../schema";
// Utils
import { LIKE_POST_TOPIC } from "../../utils/constants/Post.Constants"
import SecureUtil from "../../utils/Secure.utils";

@ObjectType()
class LikeResponse{
    @Field()
    isSuccess: boolean;

    @Field({nullable: true})
    message?: string;
}

@ObjectType()
class LikeSubResponse{
    @Field(() => User)
    userLike: User;

    @Field(() => User)
    owner: User;
    
    @Field()
    _id: String;

    @Field()
    likes: number;

    @Field(() => [User])
    listOfLike: User[];
}

@Resolver()
export class LikeResolver{
    // Query
    @UseMiddleware(isAuthenticated)
    @Query(() => [User])
    async getListOfLikes(
        @Arg('postID') postID: string,
    ): Promise<User[]> {
        const result = await getListOfLikesController(postID);
        return result as unknown as Array<User>;
    }
    // Mutation
    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    @Mutation(() => LikeResponse)
    async likePost(
        @Arg('postID') postID: string,
        @Ctx() context: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<LikeResponse> {
        const { data, response } = await likePostController(postID, context);
        const owner = await findUserController(data.owner.email);
        const clientDeviceID: string = SecureUtil.getUserClientId(context.req);
        const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
        const userLike = await findUserController(userInfo.email);
        const payload: ILikePostPayload = {
            userLike,
            _id: data._id,
            likes: data.likes,
            owner,
            listOfLike: data.listOfLike,
        }
        pubSub.publish(LIKE_POST_TOPIC, payload );
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