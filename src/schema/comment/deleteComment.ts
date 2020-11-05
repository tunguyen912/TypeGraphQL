import { Arg, Field, InputType, Mutation, ObjectType, PubSub, PubSubEngine, Resolver, Root, Subscription, UseMiddleware } from "type-graphql";
import { isAuthenticated } from "../../middlewares/isAuthenticatedMiddleware";
import { deleteCommentController } from "../../controllers/comment/commentController"
import { IPostPayload } from "../../model/types/IPostPayload.model";
import { DELETE_COMMENT_TOPIC } from "../../utils/constants/commentConstants";
import { Post } from "../schema";
import { authorizationMiddleware } from "../../middlewares/authorizationMiddleware";

@ObjectType()
class DeleteCommentResponse{
    @Field()
    isSuccess: boolean;

    @Field({nullable: true})
    message?: string;
}

@InputType()
class DeleteCommentData{
    @Field()
    commentID: string

    @Field()
    postID: string
}

@Resolver()
export class DeleteCommentResolver{
    @UseMiddleware(isAuthenticated)
    @UseMiddleware(authorizationMiddleware)
    @Mutation(() => DeleteCommentResponse)
    async deleteComment(
        @Arg('data') deleteCommentData: DeleteCommentData,
        @PubSub() pubSub: PubSubEngine
    ): Promise<DeleteCommentResponse> {
        const { commentID, postID } = deleteCommentData;
        const { data, response } = await deleteCommentController(commentID, postID);
        const payload: IPostPayload = {
            _id: data._id,
            owner: data.owner,
            content: data.content,
            likes: data.likes,
            listOfLike: data.listOfLike,
            createdAt: data.createdAt,
            comments: data.comments, 
            listOfComment: data.listOfComment
        }
        pubSub.publish(DELETE_COMMENT_TOPIC, payload);
        return response;
    }
    @Subscription(() => Post, {
        topics: DELETE_COMMENT_TOPIC,
    })
    deleteCommentSub(
        @Root() payload,
    ): Post{
        return payload;
    }
}