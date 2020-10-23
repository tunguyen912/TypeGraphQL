import { Mutation, Resolver, Ctx, ObjectType, Field } from 'type-graphql';
// import { User } from '../../model/user/userModel'
import { logOutController } from '../../controllers/user/userControllers';
import { Context } from '../../model/types/Context';

@ObjectType()
class LogoutResponse{
    @Field()
    isSuccess: boolean;

    @Field({nullable: true})
    message?: string;
}

@Resolver()
export class LogoutResolver{
    @Mutation(() => LogoutResponse)
    async logout(
        @Ctx() context: Context
    ): Promise<LogoutResponse>{
        return await logOutController(context)
    }
}

