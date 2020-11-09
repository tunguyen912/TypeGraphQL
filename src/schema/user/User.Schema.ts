import { Arg, Mutation, Resolver, Ctx, Query, UseMiddleware } from "type-graphql";
import { findMeController, logInController, registerController, logOutController } from '../../controllers/User.Controllers'
import { isAuthenticated, isNotAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";
import { Context } from "../../model/types/Context";
import { User } from "../schema";
import { LoginData, LoginResponse, LogoutResponse, RegisterData, RegisterResponse } from "./User.Type";

@Resolver()
export class UserResolver {
    // Query
    @UseMiddleware(isAuthenticated)
    @Query(() => User)
    async me(
        @Ctx() context: Context
    ): Promise<User> {
        return await findMeController(context);
    }
    //Mutation
    @UseMiddleware(isNotAuthenticated)
    @Mutation(() => LoginResponse)
    async logIn(
        @Arg('data') loginData: LoginData,
        @Ctx() context: Context
    ): Promise<LoginResponse> {
        return await logInController(loginData, context);
    }

    @Mutation(() => RegisterResponse)
    async register (
        @Arg("data") registerData: RegisterData,
    ): Promise<RegisterResponse>{
       return await registerController(registerData);
    }

    @UseMiddleware(isAuthenticated)
    @Mutation(() => LogoutResponse)
    async logout(
        @Ctx() context: Context
    ): Promise<LogoutResponse>{
        return await logOutController(context);
    }
}