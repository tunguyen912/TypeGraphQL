import { Arg, Field, InputType, Mutation, ObjectType, UseMiddleware } from "type-graphql";
import { deletePostController, updatePostController } from "../../controllers/post/postController";
import { authorizationMiddleware } from "../../middlewares/authorizationMiddleware";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";

@InputType()
class UpdatePostData{
    @Field()
    postID: string

    @Field()
    newPostContent: string
}

@ObjectType()
class DeletePostResponse{
    @Field()
    isSuccess: boolean;

    @Field({nullable: true})
    message?: string;
}

@ObjectType()
class UpdatePostResponse{
    @Field()
    isSuccess: boolean;

    @Field({nullable: true})
    message?: string;

    @Field({nullable: true})
    updatedAt?: Date;

    @Field({nullable: true})
    newPostContent?: string;
}

export class ModifyPostResolver {
    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    @Mutation(() => DeletePostResponse)
    async deletePost(
        @Arg('postID') postID: string
    ): Promise<DeletePostResponse> {
       return await deletePostController(postID);
    }
    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    @Mutation(() => UpdatePostResponse)
    async updatePost(
        @Arg('data') updatePostData: UpdatePostData
    ): Promise<UpdatePostResponse> {
        const { postID, newPostContent } = updatePostData;
        return await updatePostController(postID, newPostContent);
    }
}