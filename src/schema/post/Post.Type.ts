import { Field, InputType, ObjectType } from "type-graphql";
import { Post } from "../schema";
// Input
@InputType()
export class paginationInput{
    @Field()
    limit: number;

    @Field({ nullable: true })
    cursor?: string;
}

@InputType()
export class postData{
    @Field()
    postContent: string
}

@InputType()
export class UpdatePostData{
    @Field()
    postID: string;

    @Field()
    newPostContent: string;
}
// Data
@ObjectType()
export class PostResponse{
    @Field()
    isSuccess: boolean;

    @Field({ nullable: true })
    message?: string;
}

@ObjectType()
// Dung cho Sub
export class UpdatePostResponse{
    @Field()
    isSuccess: boolean;

    @Field({nullable: true})
    message?: string;

    @Field({nullable: true})
    updatedAt?: Date;

    @Field({nullable: true})
    newPostContent?: string;
}

@ObjectType()
export class GetPostListResponse{
    @Field(() => [Post])
    data: Post[];

    @Field({ nullable: true })
    totalPost?: Number
}