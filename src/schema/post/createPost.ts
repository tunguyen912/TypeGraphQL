import { Arg, Ctx, Field, InputType, Mutation, ObjectType, PubSub, PubSubEngine, Resolver, Root, Subscription, UseMiddleware } from "type-graphql";
import { createPostController } from "../../controllers/post/postController";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";
import { Context } from "../../model/types/Context";
import { Post } from "./getPost";
import { CREATE_POST_TOPIC } from "../../utils/constants/postConstants";
import { IPostPayload } from "../../model/types/IPostPayload.model";

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