import { Arg, Field, Mutation, ObjectType, Resolver, InputType, Ctx, Query, UseMiddleware } from "type-graphql";
import { findMeController, logInController } from '../../controllers/user/userControllers'
import { isAuthenticated, isNotAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";
import { Context } from "../../model/types/Context";

@ObjectType()
export class User{
    @Field({ nullable: true })
    _id?: string

    @Field({ nullable: true })
    profileName?: string;

    @Field({ nullable: true })
    email?: string

}

@InputType()
export class loginData {
    @Field()
    email: string;

    @Field()
    password: string;
}

@ObjectType()
class LoginResponse {
    @Field()
    isSuccess: boolean;

    @Field({ nullable: true })
    message?: string;

    @Field({ nullable: true })
    jwt?: string;
}

@Resolver()
export class LoginResolver {
    @UseMiddleware(isAuthenticated)
    @Query(() => User)
    async me(
        @Ctx() context: Context
    ): Promise<User> {
        return await findMeController(context);
    }

    @UseMiddleware(isNotAuthenticated)
    @Mutation(() => LoginResponse)
    async logIn(
        @Arg('data') loginData: loginData,
        @Ctx() context: Context
    ): Promise<LoginResponse> {
        return await logInController(loginData, context)
    }
}