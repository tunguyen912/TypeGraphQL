import { Arg, Ctx, Mutation, PubSub, PubSubEngine, Query, Resolver, Root, Subscription, UseMiddleware } from "type-graphql";
// Controller
import { createMessageController, getConversationController } from "../../controllers/Message.Controller";
// Middleware
import { authorizationMiddleware } from "../../middlewares/authorizationMiddleware";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";
// Model
import { Context } from "../../model/types/Context";
import { IMessagePayload } from "../../model/types/IPayload.model";
import { Message } from "../schema";
import { messageData, MessageResponse } from "./Message.Type";

import { NEW_MESSAGE_TOPIC } from "../../utils/constants/Message.Constants";

@Resolver()
export class MessageResolver{
    // Query
    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    @Query(() => [Message])
    async getConversationHistory(
        @Arg('withUser') withUser: string,
        @Ctx() context: Context
    ): Promise<Message[]> {
        return await getConversationController(context, withUser);
    }
    // Mutation
    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    @Mutation(() => MessageResponse)
    async sendMessage(
        @Arg('data') messageData: messageData,
        @Ctx() context: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<MessageResponse> {
        const { data, response } =  await createMessageController(messageData, context)
        const payload: IMessagePayload = {
            _id: data._id,
            messageFrom: data.messageFrom,
            messageTo: data.messageTo,
            messageContent: data.messageContent,
            conversationID: data.conversationID,
            createdAt: data.createdAt,
        }
        pubSub.publish(NEW_MESSAGE_TOPIC, payload)
        return response;
    }
    // Subscription
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