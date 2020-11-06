import { Arg, Ctx, Field, Mutation, ObjectType, Resolver, PubSub, PubSubEngine, UseMiddleware, Subscription, Root, Query } from "type-graphql";
import redisClient from "../../config/redisConfig";
// Controllers
import { getListOfLikesController, likePostController } from "../../controllers/post/postController";
import { findUserController } from "../../controllers/user/userControllers";
// Middlewares
import { authorizationMiddleware } from "../../middlewares/authorizationMiddleware";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";
// Models
import { Context } from "../../model/types/Context";
import { ILikePostPayload } from "../../model/types/ILikePostPayload.model";
import { IUserPayload } from "../../model/types/IUserPayload.model";
import { User } from "../schema";
// Utils
import { LIKE_POST_TOPIC } from "../../utils/constants/postConstants"
import { getUserClientId } from "../../utils/utils";

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

    @Field()
    createdAt: Date;
}

@Resolver()
export class likeResolver{
    @UseMiddleware(isAuthenticated)
    @Query(() => [User])
    async getListOfLikes(
        @Arg('postID') postID: string,
    ): Promise<User[]> {
        const result = await getListOfLikesController(postID);
        return result as unknown as Array<User>;
    }

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
        const clientDeviceID: string = getUserClientId(context.req);
        const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
        const userLike = await findUserController(userInfo.email);
        const payload: ILikePostPayload = {
            userLike,
            _id: data._id,
            likes: data.likes,
            owner
        }
        pubSub.publish(LIKE_POST_TOPIC, payload );
        return response;
    }
    @Subscription(() => LikeSubResponse, {
        topics: LIKE_POST_TOPIC,
        // filter: ({ payload, args }) => {
        //     return payload.data.owner.email === args.owner && payload.isLike
        //     return payload.data.owner.email === args.owner 
        // }
    })
    likePostSub(
        @Root() payload,
        // @Arg('owner') owner: string,
    ): LikeSubResponse{
        return payload;
    }
}