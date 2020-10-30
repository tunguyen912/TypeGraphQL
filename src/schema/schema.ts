import { buildSchemaSync } from "type-graphql";
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

const pubSub = new PubSub()
export const schema = buildSchemaSync({
    resolvers: [RegisterResolver, LoginResolver, LogoutResolver, messageResolver, PostResolver, likeResolver, CommentResolver, messageQueryResolver, GetPostResolver],
    pubSub,
    dateScalarMode: 'isoDate',
});