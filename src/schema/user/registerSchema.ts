import { Arg, Field, Mutation, ObjectType, Query, Resolver, InputType, UseMiddleware } from "type-graphql";
import { registerController } from '../../controllers/user/userControllers'
import {isAuthenticated} from '../../middlewares/isAuthenticatedMiddleware'

@InputType()
export class registerData {
    @Field()
    firstName: string;

    @Field()
    lastName: string;

    @Field()
    email: string;

    @Field()
    password: string;
}

@ObjectType()
class RegisterResponse{
    @Field()
    isSuccess: boolean;

    @Field({nullable: true})
    message?: string;
}

@Resolver()
export class RegisterResolver {
    @UseMiddleware(isAuthenticated)
    @Query(() => String)
    hello() {
        return 'Hello World'
    }
    @Mutation(() => RegisterResponse)
    async register (
        @Arg('data') registerData: registerData
    ): Promise<RegisterResponse>{
       return await registerController(registerData)
    }
}