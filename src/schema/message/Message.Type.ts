import { Field, InputType } from "type-graphql";

@InputType()
export class messageData{
    @Field()
    toUser: string;

    @Field()
    messageContent: string;
}
