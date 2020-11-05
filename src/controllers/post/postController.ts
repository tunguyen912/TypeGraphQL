import { PostModel } from "../../model/post/postModel";
import { Context } from "../../model/types/Context";
import { IDefaultResponse } from "../../model/types/IResponse.model";
import { ISession } from "../../model/types/ISession.model";
import { User, UserModel } from "../../model/user/userModel";
import { defaultResponse, getUserClientId, updatePostResponse } from "../../utils/utils";
import { CREATE_POST_SUCCESS, ERROR, LIKE_POST_SUCCESS,
         DELETE_POST_SUCCESS, DELETE_POST_FAIL, UPDATE_POST_SUCCESS, UPDATE_POST_FAIL, UNLIKE_POST } from "../../utils/constants/postConstants"
import { mongo } from 'mongoose';
import { postData } from "../../schema/post/createPost";
import { CommentModel } from "../../model/comment/commentModel";
import redisClient from "../../config/redisConfig";
import { IUserPayload } from "../../model/types/IUserPayload.model";


export async function createPostController(postData: postData, context: Context) {
    const { postContent } = postData;
    const clientDeviceID: string = getUserClientId(context.req);
    const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
    const newPostInfo = new PostModel({
        owner: await UserModel.findOne({ email: userInfo.email }),
        content: postContent
    })
    const newPost = await newPostInfo.save();
    const _newPostId = mongo.ObjectId(newPost._id);
    const result = await PostModel.findById(_newPostId)
    .populate('owner', 'profileName email')
    .populate('listOfLike', 'profileName email')
    .populate({ path: 'listOfComment', populate: 'owner' });
    if (newPost) return {data: result, response: defaultResponse(true, CREATE_POST_SUCCESS)};
    throw new Error(ERROR);
}

export async function likePostController(postID: string, context: Context) {
    const clientDeviceID: string = getUserClientId(context.req);
    const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
    const _postID = mongo.ObjectId(postID)
    const post = await PostModel.findOne({ _id: _postID });
    const user = await UserModel.findOne({ email: userInfo.email });
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
        .populate('owner', 'profileName email')
        .populate('listOfLike', 'profileName email')
        .populate({ path: 'listOfComment', populate: 'owner' });
}

export async function getPostByIdController(id: string) {
    const _postId = mongo.ObjectId(id);
    return await PostModel.findOne({_id: _postId})
        .populate('owner', 'profileName email')
        .populate('listOfLike', 'profileName email')
        .populate({ path: 'listOfComment', populate: 'owner' });
}

export const getPostByOwnerIdController = async (ownerID: string) => {
    const _ownerId = mongo.ObjectId(ownerID);
    const result = await PostModel.find({owner: _ownerId})
    .populate('owner', 'profileName email')
    .populate('listOfLike', 'profileName email')
    .populate({ path: 'listOfComment', populate: 'owner' });
    if(result) return result;
    throw new Error(ERROR);
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