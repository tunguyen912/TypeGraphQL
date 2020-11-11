import { Field, InputType } from "type-graphql";
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
    newCommentContent: string;
}
