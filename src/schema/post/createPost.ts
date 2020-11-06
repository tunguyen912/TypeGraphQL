import { Arg, Ctx, Field, InputType, Mutation, ObjectType, PubSub, PubSubEngine, Resolver, Root, Subscription, UseMiddleware } from "type-graphql";
// Controllers
import { createPostController } from "../../controllers/post/postController";
// Models
import { Context } from "../../model/types/Context";
import { Post } from "../schema";
import { IPostPayload } from "../../model/types/IPostPayload.model";
// Middlewares
import { authorizationMiddleware } from "../../middlewares/authorizationMiddleware";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";

import { CREATE_POST_TOPIC } from "../../utils/constants/postConstants";


@InputType()
export class postData{
    @Field()
    postContent: string
}

@ObjectType()
class PostResponse{
    @Field()
    isSuccess: boolean;

    @Field({ nullable: true })
    message?: string;
}

@Resolver()
export class PostResolver{
    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    @Mutation(() => PostResponse)
    async createPost(
        @Arg('data') postData: postData,
        @PubSub() pubSub: PubSubEngine,
        @Ctx() context: Context,
    ): Promise<PostResponse> {
        const result = await createPostController(postData, context);
        const payload: IPostPayload = {
            _id: result.data._id,
            owner: result.data.owner,
            content: result.data.content,
            likes: result.data.likes,
            listOfLike: result.data.listOfLike,
            createdAt: result.data.createdAt,
            comments: result.data.comments, 
            listOfComment: result.data.listOfComment,
        }
        pubSub.publish(CREATE_POST_TOPIC,  payload);
        return result.response;
    }
    //Subscription to update new post
    @Subscription(() => Post, {
        topics: CREATE_POST_TOPIC,
    })
    createPostSub(
        @Root() payload,
    ): Post{
        return payload;
    }
}