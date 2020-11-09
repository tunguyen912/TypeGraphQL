import { Field, InputType, ObjectType } from "type-graphql";
// Input
@InputType()
export class paginationInput{
    @Field({ nullable: true })
    limit?: number;

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
