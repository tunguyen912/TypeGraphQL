import { Arg, Field, Mutation, ObjectType, Query, Resolver, InputType, Ctx } from "type-graphql";
// import { User } from '../../model/user/userModel'
import { logInController } from '../../controllers/user/userControllers'
import { IContext } from "../../types/IContext";

@InputType()
class loginData {
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
    @Query(() => String)
    hello() {
        return 'Hello World'
    }
    @Mutation(() => LoginResponse)
    async logIn (
        // @Arg('email') email: String,
        // @Arg('password') password: String,
        @Arg('data') loginData: loginData,    
        @Ctx() context: IContext
    ): Promise<LoginResponse>{
        return await logInController(loginData, context)
        // return await logInController({email, password}, context);
    }
}