import { Field, InputType, ObjectType } from "type-graphql";
import { User } from "../schema";
// Input
@InputType()
export class commentData{
    @Field()
    commentContent: string;

    @Field()
    postID: string;
}

@InputType()
export class DeleteCommentData{
    @Field()
    commentID: string;

    @Field()
    postID: string;
}

@InputType()
export class UpdateCommentData{
    @Field()
    commentID: string;

    @Field()
    postID: string;

    @Field()
    newCommentContent: string;
}

@ObjectType()
export class CommentNotiResponse{
    @Field(() => User)
    userComment: User

    @Field()
    postID: string;
}