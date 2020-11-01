import { Arg, Ctx, Field, InputType, Mutation, ObjectType, PubSub, PubSubEngine, Query, Resolver, Root, Subscription, UseMiddleware } from "type-graphql";
import { createMessageController } from "../../controllers/message/messageController";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";
import { Context } from "../../model/types/Context";
import { IMessagePayload } from "../../model/types/IMessagePayload.model";
import { NEW_MESSAGE_TOPIC } from "../../utils/constants/messageConstants";
import { Message } from "../schema";

@InputType()
export class messageData{
    @Field()
    toUser: string

    @Field()
    messageContent: string
}

@ObjectType()
class MessageResponse{
    @Field()
    isSuccess: boolean;

    @Field({nullable: true})
    message?: string;
}

@Resolver()
export class messageResolver{
    @UseMiddleware(isAuthenticated)
    @Mutation(() => MessageResponse)
    async sendMessage(
        @Arg('data') messageData: messageData,
        @Ctx() context: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<MessageResponse> {
        const { result, response } =  await createMessageController(messageData, context)
        const payload: IMessagePayload = {
            messageFrom: result.messageFrom,
            messageTo: result.messageTo,
            messageContent: result.messageContent,
            conversationID: result.conversationID,
            createdAt: result.createdAt,
        }
        pubSub.publish(NEW_MESSAGE_TOPIC, payload)
        return response;
    }
    @Subscription(() => Message, {
        topics: NEW_MESSAGE_TOPIC,
        filter: ({payload, args}) => {
            return payload.messageTo.email === args.toUser
        }
    })
    createMessage(
        @Root() payload: IMessagePayload,
        @Arg('toUser') toUser: string
    ): Message{
        return payload;
    }
}