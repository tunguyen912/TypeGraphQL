import { Field, InputType, ObjectType } from "type-graphql";

@InputType()
export class messageData{
    @Field()
    toUser: string;

    @Field()
    messageContent: string;
}

@ObjectType()
export class MessageResponse{
    @Field()
    isSuccess: boolean;

    @Field({nullable: true})
    message?: string;
}