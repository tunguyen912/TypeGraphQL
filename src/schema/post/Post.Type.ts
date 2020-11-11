import { Field, InputType, ObjectType } from "type-graphql";
import { User } from '../schema';
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
export class LikeSubResponse{
    @Field(() => User)
    userLike: User;

    @Field(() => User)
    owner: User;
    
    @Field()
    _id: String;

    @Field()
    likes: number;
}