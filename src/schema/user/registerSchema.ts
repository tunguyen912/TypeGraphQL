import { Arg, Field, Mutation, ObjectType, Query, Resolver, InputType } from "type-graphql";
import { registerController } from '../../controllers/user/userControllers'

@InputType()
class registerData {
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