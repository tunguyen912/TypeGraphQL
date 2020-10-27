import { Arg, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import { registerController } from '../../controllers/user/userControllers'

@ObjectType()
class RegisterResponse{
    @Field()
    isSuccess: boolean;

    @Field({nullable: true})
    message?: string;
}

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

@Resolver()
export class RegisterResolver {
    @Mutation(() => RegisterResponse)
    async register (
        @Arg("data") registerData: registerData,
    ): Promise<RegisterResponse>{
       return await registerController(registerData)
    }
}