import { PostModel } from "../../model/post/postModel";
import { Context } from "../../model/types/Context";
import { IDefaultResponse } from "../../model/types/IResponse.model";
import { ISession } from "../../model/types/ISession.model";
import { User, UserModel } from "../../model/user/userModel";
import { defaultResponse } from "../../utils/utils";
import { CREATE_POST_SUCCESS, ERROR, LIKE_POST_SUCCESS } from "../../utils/constants/postConstants"
import { mongo } from 'mongoose';
import { postData } from "../../schema/post/createPost";


export async function createPostController(postData: postData, context: Context): Promise<IDefaultResponse> {
    const { postContent } = postData;
    const sess: ISession = context.req.session
    const { email } = sess.user;
    const newPost = new PostModel({
        userID: await UserModel.findOne({ email }),
        content: postContent
    })
    let result = await newPost.save();
    if(result) return defaultResponse(true, CREATE_POST_SUCCESS);
    throw new Error(ERROR);
}

export async function likePostController(postID: string, context: Context){
    const sess: ISession = context.req.session
    const _postID = mongo.ObjectId(postID)

    const post = await PostModel.findOne({ _id: _postID });
    const user = await UserModel.findOne({ email: sess.user.email });
    let result, isLike: boolean;
    if(post.listOfLike.includes(user._id)){
        result = await PostModel.findOneAndUpdate(
            { _id: _postID },
            {
                $inc: { likes: -1 },
                $pull: { listOfLike: user._id }
            },
            { new: true }
        );
        isLike = false;
    }else{
        result = await PostModel.findOneAndUpdate(
            { _id: _postID },
            {
                $inc: { likes: 1 },
                $addToSet: { listOfLike: user._id }
            },
            { new: true }
        );
        isLike = true;
    }
    if(result) return { result, isLike, response: defaultResponse(true, LIKE_POST_SUCCESS) };
    throw new Error(ERROR);
}

export async function getListOfLikesController(postID: string): Promise<User[]> {
    const _postID = mongo.ObjectId(postID);
    const post = await PostModel.findOne({ _id: _postID });
    if(post) return post.listOfLike;
    // loop to return email
    return null;
}