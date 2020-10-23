import { Arg, Field, Mutation, ObjectType, Resolver, InputType, Ctx } from "type-graphql";
// import { User } from '../../model/user/userModel'
import { logInController } from '../../controllers/user/userControllers'
import { Context } from "../../model/types/Context";

@InputType()
export class loginData {
    @Field()
    email: string;

    @Field()
    password: string;
}

@ObjectType()
class LoginResponse{
    @Field()
    isSuccess: boolean;

    @Field({nullable: true})
    message?: string;

    @Field({nullable: true})
    jwt?: string;
}

// @Resolver(User)
@Resolver()
export class LoginResolver {
    @Mutation(() => LoginResponse)
    async logIn (
        @Arg('data') loginData: loginData,    
        @Ctx() context: Context
    ): Promise<LoginResponse>{
        return await logInController(loginData, context)
    }
}