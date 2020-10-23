import { Arg, Ctx, Field, InputType, Mutation, ObjectType, PubSub, PubSubEngine, Resolver, Root, Subscription } from "type-graphql";
import { createMessageController } from "../../controllers/message/messageController";
import { Context } from "../../model/types/Context";
import { IMessagePayload } from "../../model/types/IMessagePayload.model";
import { NEW_MESSAGE_TOPIC } from "../../utils/constants/messageConstants";


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

@ObjectType()
class Message {
    @Field()
    from: string

    @Field()
    to: string

    @Field()
    content: string
}

@Resolver()
export class messageResolver{
    @Mutation(() => MessageResponse)
    async sendMessage(
        @Arg('data') messageData: messageData,
        @Ctx() context: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<MessageResponse> {
        const payload: IMessagePayload = {
            messageFrom: context.req.session.user.email,
            messageTo: messageData.toUser,
            messageContent: messageData.messageContent
        }
        pubSub.publish(NEW_MESSAGE_TOPIC, payload)
        return await createMessageController(messageData, context)
    }
    @Subscription(() => Message, {
        topics: NEW_MESSAGE_TOPIC,
        filter: ({payload, args}) => {
            console.log(args)
            return payload.messageTo === args.toUser
        }
    })
    createMessage(
        @Root() {messageFrom, messageTo, messageContent}: IMessagePayload,
        @Arg('toUser') toUser: string
    ): Message{
        return {
            from: messageFrom, 
            to: messageTo, 
            content: messageContent
        }
    }
}