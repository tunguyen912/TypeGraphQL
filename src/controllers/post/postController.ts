import { PostModel } from "../../model/post/postModel";
import { Context } from "../../model/types/Context";
import { IDefaultResponse } from "../../model/types/IResponse.model";
import { ISession } from "../../model/types/ISession.model";
import { UserModel } from "../../model/user/userModel";
import { postData } from "../../schema/post/createPost";
import { defaultResponse } from "../../utils/utils";
import { CREATE_POST_SUCCESS, ERROR, LIKE_POST_SUCCESS } from "../../utils/constants/postConstants"
import { mongo } from 'mongoose';


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

export async function likePostController(postID: string, context: Context): Promise<IDefaultResponse> {
    const sess: ISession = context.req.session
    const _postID = mongo.ObjectId(postID)

    const list = await PostModel.findOne({ _id: _postID });
    const user = await UserModel.findOne({ email: sess.user.email });
    let result;
    if(list.listOfLike.includes(user._id)){
        result = await PostModel.findOneAndUpdate(
            { _id: _postID },
            {
                $inc: { likes: -1 },
                $pull: { listOfLike: user._id }
            }
        );
    }else{
        result = await PostModel.findOneAndUpdate(
            { _id: _postID },
            {
                $inc: { likes: 1 },
                $addToSet: { listOfLike: user._id }
            }
        );
    }
    if(result) return defaultResponse(true, LIKE_POST_SUCCESS)
    // if(result) return result;
    throw new Error(ERROR);
}