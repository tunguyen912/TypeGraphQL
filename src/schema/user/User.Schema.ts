import { Arg, Mutation, Resolver, Ctx, Query, UseMiddleware } from "type-graphql";
import UserController from '../../controllers/User.Controllers'
import { isAuthenticated, isNotAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";
import { Context } from "../../model/types/Context";
import { User, DefaultResponse } from "../schema";
import { LoginData, LoginResponse, RegisterData } from "./User.Type";

@Resolver()
export class UserResolver {
    // Query
    @UseMiddleware(isAuthenticated)
    @Query(() => User)
    async me(
        @Ctx() context: Context
    ): Promise<User> {
        return await UserController.findMeController(context);
    }
    //Mutation
    @UseMiddleware(isNotAuthenticated)
    @Mutation(() => LoginResponse)
    async logIn(
        @Arg('data') loginData: LoginData,
        @Ctx() context: Context
    ): Promise<LoginResponse> {
        return await UserController.logInController(loginData, context);
    }

    @Mutation(() => DefaultResponse)
    async register (
        @Arg("data") registerData: RegisterData,
    ): Promise<DefaultResponse>{
       return await UserController.registerController(registerData);
    }

    @UseMiddleware(isAuthenticated)
    @Mutation(() => DefaultResponse)
    async logout(
        @Ctx() context: Context
    ): Promise<DefaultResponse>{
        return await UserController.logOutController(context);
    }
}