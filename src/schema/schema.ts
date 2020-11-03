import { buildSchemaSync, Field, ObjectType } from "type-graphql";
import { PubSub } from 'apollo-server-express';

import { RegisterResolver } from './user/registerSchema';
import { LoginResolver } from './user/loginSchema';
import { LogoutResolver } from "./user/logoutSchema";
import { PostResolver } from "./post/createPost";
import { likeResolver } from "./post/likePost";
import { messageResolver } from "./message/createMessage";
import { CommentResolver } from "./comment/addComment";
import { messageQueryResolver } from "./message/getMessage";
import { GetPostResolver } from "./post/getPost";
import { UpdateCommentResolver } from "./comment/updateComment";
import { DeleteCommentResolver } from "./comment/deleteComment";
import { ModifyPostResolver } from "./post/ModifyPost";

@ObjectType()
export class User{
    @Field({ nullable: true })
    _id?: string

    @Field({ nullable: true })
    profileName?: string;

    @Field({ nullable: true })
    email?: string
}

@ObjectType()
export class Message {
    @Field(() => User)
    messageFrom: User

    @Field(() => User)
    messageTo: User

    @Field()
    messageContent: string

    @Field()
    conversationID: string

    @Field()
    createdAt: Date
}

@ObjectType()
export class CommentDataResponse{
    @Field()
    _id: string;

    @Field()
    owner: User;
    
    @Field()
    content: string;

    @Field()
    createdAt: Date
}

const pubSub = new PubSub()
export const schema = buildSchemaSync({
    resolvers: [RegisterResolver, LoginResolver, LogoutResolver, messageResolver, PostResolver, ModifyPostResolver,
                likeResolver, CommentResolver, messageQueryResolver, GetPostResolver, UpdateCommentResolver, DeleteCommentResolver],
    pubSub,
    dateScalarMode: 'isoDate',
});