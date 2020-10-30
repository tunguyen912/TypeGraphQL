import { Arg, Ctx, Query, Resolver, UseMiddleware } from "type-graphql";
import { getConversationController } from "../../controllers/message/messageController";
import { authorizationMiddleware } from "../../middlewares/authorizationMiddleware";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";
import { Context } from "../../model/types/Context";
import { Message } from "./createMessage";

@Resolver()
export class messageQueryResolver{
    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    @Query(() => [Message])
    async getConversationHistory(
        @Arg('withUser') withUser: string,
        @Ctx() context: Context
    ): Promise<Message[]> {
        const result = await getConversationController(context, withUser);
        return result as unknown as Array<Message>;
    }
}