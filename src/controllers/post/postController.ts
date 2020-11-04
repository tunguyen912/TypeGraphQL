import { Post, PostModel } from "../../model/post/postModel";
import { Context } from "../../model/types/Context";
import { IDefaultResponse } from "../../model/types/IResponse.model";
import { ISession } from "../../model/types/ISession.model";
import { User, UserModel } from "../../model/user/userModel";
import { defaultResponse, updatePostResponse } from "../../utils/utils";
import { CREATE_POST_SUCCESS, ERROR, LIKE_POST_SUCCESS,
         DELETE_POST_SUCCESS, DELETE_POST_FAIL, UPDATE_POST_SUCCESS, UPDATE_POST_FAIL, UNLIKE_POST } from "../../utils/constants/postConstants"
import { mongo } from 'mongoose';
import { postData } from "../../schema/post/createPost";
import { CommentModel } from "../../model/comment/commentModel";


export async function createPostController(postData: postData, context: Context): Promise<IDefaultResponse> {
    const { postContent } = postData;
    const sess: ISession = context.req.session
    const { email } = sess.user;
    const newPost = new PostModel({
        owner: await UserModel.findOne({ email }),
        content: postContent
    })
    let result = await newPost.save();
    if (result) return defaultResponse(true, CREATE_POST_SUCCESS);
    throw new Error(ERROR);
}

export async function likePostController(postID: string, context: Context) {
    const sess: ISession = context.req.session
    const _postID = mongo.ObjectId(postID)

    const post = await PostModel.findOne({ _id: _postID });
    const user = await UserModel.findOne({ email: sess.user.email });
    let result, isLike: boolean;
    if (post.listOfLike.includes(user._id)) {
        result = await PostModel.findOneAndUpdate(
            { _id: _postID },
            {
                $inc: { likes: -1 },
                $pull: { listOfLike: user._id }
            },
            { new: true }
        );
        isLike = false;
    } else {
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
    if (result) {
        if(isLike) return { result, isLike, response: defaultResponse(true, LIKE_POST_SUCCESS) };
        return { result, isLike, response: defaultResponse(true, UNLIKE_POST) }
    }
    throw new Error(ERROR);
}

export async function getListOfLikesController(postID: string): Promise<User[]> {
    const _postID = mongo.ObjectId(postID);
    const post = await PostModel.findOne({ _id: _postID }).populate('listOfLike');
    if (post) return post.listOfLike;
    return null;
}

export async function getAllPostController() {
    return await PostModel.find({})
        .populate('owner')
        .populate('listOfLike')
        .populate({ path: 'listOfComment', populate: 'owner' });
}

export async function getPostByIdController(id: string) {
    const _postId = mongo.ObjectId(id);
    return await PostModel.findOne({_id: _postId})
        .populate('owner')
        .populate('listOfLike')
        .populate({ path: 'listOfComment', populate: 'owner' });
}


export async function deletePostController(id: string): Promise<IDefaultResponse> {
    const _id = mongo.ObjectId(id);
    const postToDelete = await PostModel.findOne({ _id });
    const deletePost =  await postToDelete.delete();
    const listOfComment = postToDelete.listOfComment;
    const deleteComment = await CommentModel.deleteMany({
        _id: { $in: listOfComment }
    });
    if(deleteComment && deletePost) return defaultResponse(true, DELETE_POST_SUCCESS);
    return defaultResponse(false, DELETE_POST_FAIL);
}

export async function updatePostController(postID: string, newPostContent: string): Promise<IDefaultResponse> {
    const _postID = mongo.ObjectId(postID);
    const result = await PostModel.findByIdAndUpdate(
        _postID, 
        { 
            content: newPostContent, 
            createdAt: Date.now()
        }, 
        { new: true }
    );
    if(result) return updatePostResponse(true, UPDATE_POST_SUCCESS, result.content, result.createdAt);
    return updatePostResponse(false, UPDATE_POST_FAIL);
}