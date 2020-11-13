import { buildSchemaSync, Field, ObjectType } from "type-graphql";
import { PubSub } from 'apollo-server-express';

import { UserResolver } from './user/User.Schema';
import { PostResolver } from "./post/Post.Schema";
import { LikeResolver } from "./post/LikePost.Schema";
import { MessageResolver } from "./message/Message.Schema";
import { CommentResolver } from "./comment/Comment.Schema";

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
    createdAt: Date;

    @Field({nullable: true})
    toPostId?: string;
}

@ObjectType()
export class DefaultResponse{
    @Field()
    isSuccess: boolean;

    @Field({ nullable: true })
    message?: string;
}

@ObjectType()
export class Post{
    @Field({ nullable: true })
    _id?: string;

    @Field(() => User)
    owner: User;

    @Field()
    content: string;

    @Field()
    likes: number;

    @Field(() => [User])
    listOfLike: User[];

    @Field()
    createdAt: Date;

    @Field()
    comments: number; 

    @Field(() => [CommentDataResponse])
    listOfComment: CommentDataResponse[];
}

const pubSub = new PubSub()
export const schema = buildSchemaSync({
    resolvers: [UserResolver, MessageResolver, PostResolver, LikeResolver, CommentResolver],
    pubSub,
    dateScalarMode: 'isoDate',
});