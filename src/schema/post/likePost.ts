import { Arg, Ctx, Field, Mutation, ObjectType, Resolver, PubSub, PubSubEngine, UseMiddleware } from "type-graphql";
import { likePostController } from "../../controllers/post/postController";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";
import { Context } from "../../model/types/Context";

@ObjectType()
class LikeResponse{
    @Field()
    isSuccess: boolean;

    @Field({nullable: true})
    message?: string;
}

@Resolver()
export class likeResolver{
    @UseMiddleware(isAuthenticated)
    @Mutation(() => LikeResponse)
    async likePost(
        @Arg('postID') postID: string,
        @Ctx() context: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<LikeResponse> {
        // const payload: IMessagePayload = {
        //     messageFrom: await findUserController(context.req.session.user.email),
        //     messageTo: await findUserController(messageData.toUser),
        //     messageContent: messageData.messageContent
        // }
        // pubSub.publish(NEW_MESSAGE_TOPIC, payload)
        return await likePostController(postID, context)
    }


}