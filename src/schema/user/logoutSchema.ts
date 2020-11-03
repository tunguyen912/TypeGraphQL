import { Mutation, Resolver, Ctx, ObjectType, Field, UseMiddleware, Arg } from 'type-graphql';
import { logOutController, logOutByEmailController } from '../../controllers/user/userControllers';
import { isAuthenticated } from '../../middlewares/isAuthenticatedMiddleware';
import { Context } from '../../model/types/Context';

@ObjectType()
class LogoutResponse{
    @Field()
    isSuccess: boolean;

    @Field({ nullable: true })
    message?: string;
}

@Resolver()
export class LogoutResolver{
    @UseMiddleware(isAuthenticated)
    @Mutation(() => LogoutResponse)
    async logout(
        @Ctx() context: Context
    ): Promise<LogoutResponse>{
        return await logOutController(context)
    }

    // For test only
    @Mutation(() => LogoutResponse)
    async logOutByEmail(
        @Arg('email') email: string
    ): Promise<LogoutResponse>{
        return await logOutByEmailController(email)
    }
}

