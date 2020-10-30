import { Field, ObjectType, Query, Resolver } from "type-graphql";
import { getAllPostController } from "../../controllers/post/postController";
import { CommentSubResponse } from '../comment/addComment'
import { User } from "../user/loginSchema";
import { findUserByIdController } from "../../controllers/user/userControllers"

@ObjectType()
class Post{
    //Tam thoi de no nullable
    @Field({ nullable: true })
    owner?: User;

    //Tam thoi de no nullable
    @Field({ nullable: true })
    content?: string;

    //Tam thoi de no nullable
    @Field({ nullable: true })
    likes?: number;

    //Tam thoi de no nullable
    @Field(() => [User], { nullable: true })
    listOfLike?: User[];

    //Tam thoi de no nullable
    @Field({ nullable: true })
    createdAt?: Date;

    //Tam thoi de no nullable
    @Field({ nullable: true })
    comments?: number; 

    //Tam thoi de no nullable
    @Field(() => [CommentSubResponse], { nullable: true })
    listOfComment?: CommentSubResponse[];
}
@Resolver()
export class GetPostResolver{
    @Query(() => [Post])
    async getAllPost(): Promise<Post[]> {
        let result = await getAllPostController();
        // result.userID = await findUserByIdController(result.userID)
        console.log(result)
        // Phai loop de lay ra du lieu
        return result as unknown as Array<Post>;
    }
}