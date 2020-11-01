import { Arg, Ctx, Field, Mutation, ObjectType, Resolver, PubSub, PubSubEngine, UseMiddleware, Subscription, Root, Query } from "type-graphql";
import { getListOfLikesController, likePostController } from "../../controllers/post/postController";
import { findUserByIdController, findUserController } from "../../controllers/user/userControllers";
import { authorizationMiddleware } from "../../middlewares/authorizationMiddleware";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";
import { Context } from "../../model/types/Context";
import { ILikePostPayload } from "../../model/types/IPostPayload.model";
import { LIKE_POST_TOPIC } from "../../utils/constants/postConstants"
import { User } from "../schema";

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
    content: string;

    @Field()
    likes: number;

    @Field()
    createdAt: Date;
}

@Resolver()
export class likeResolver{
    @UseMiddleware(isAuthenticated)
    // @UseMiddleware(authorizationMiddleware)
    @Query(() => [User])
    async getListOfLikes(
        @Arg('postID') postID: string,
    ): Promise<User[]> {
        const result = await getListOfLikesController(postID);
        return result as unknown as Array<User>;
    }

    @UseMiddleware(isAuthenticated)
    @Mutation(() => LikeResponse)
    async likePost(
        @Arg('postID') postID: string,
        @Ctx() context: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<LikeResponse> {
        const { result, isLike, response } = await likePostController(postID, context);
        const owner = await findUserByIdController(result.userID);
        const userLike = await findUserController(context.req.session.user.email);
        const payload: ILikePostPayload = {
            userLike,
            content: result.content,
            likes: result.likes,
        }
        pubSub.publish(LIKE_POST_TOPIC, { data: payload, isLike });
        return response;
    }
    @Subscription(() => LikeSubResponse, {
        topics: LIKE_POST_TOPIC,
        filter: ({ payload, args }) => {
            return payload.data.owner.email === args.owner && payload.isLike
        }
    })
    likePostSub(
        @Root() payload,
        @Arg('owner') owner: string,
    ): LikeSubResponse{
        return payload.data;
    }
}