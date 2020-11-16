import { Field, InputType, ObjectType } from "type-graphql";
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
// Data
@ObjectType()
export class CommentResponse{
    @Field()
    isSuccess: boolean;

    @Field({nullable: true})
    message?: string;
}

@ObjectType()
export class DeleteCommentResponse{
    @Field()
    isSuccess: boolean;

    @Field({nullable: true})
    message?: string;
}

