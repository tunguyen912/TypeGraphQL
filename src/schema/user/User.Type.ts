import { Field, InputType, ObjectType } from "type-graphql";
// Input
@InputType()
export class LoginData {
    @Field()
    email: string;

    @Field()
    password: string;
}

@InputType()
export class RegisterData {
    @Field()
    firstName: string;

    @Field()
    lastName: string;

    @Field()
    email: string;

    @Field()
    password: string;
}
// Data
@ObjectType()
export class LogoutResponse{
    @Field()
    isSuccess: boolean;

    @Field({ nullable: true })
    message?: string;
}

@ObjectType()
export class RegisterResponse{
    @Field()
    isSuccess: boolean;

    @Field({nullable: true})
    message?: string;
}

@ObjectType()
export class LoginResponse {
    @Field()
    isSuccess: boolean;

    @Field({ nullable: true })
    message?: string;

    @Field({ nullable: true })
    jwt?: string;
}