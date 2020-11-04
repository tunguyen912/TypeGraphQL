import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver, UseMiddleware } from "type-graphql";
import { createPostController } from "../../controllers/post/postController";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";
import { Context } from "../../model/types/Context";

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
        @Ctx() context: Context,
    ): Promise<PostResponse> {
        return await createPostController(postData, context)
    }
    //Subscription to update new post
}