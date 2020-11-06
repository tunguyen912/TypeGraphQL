import redisClient from "../../config/redisConfig";
import { mongo } from 'mongoose';
// Utils
import { defaultResponse, getUserClientId, updatePostResponse } from "../../utils/utils";
// Model
import { PostModel } from "../../model/post/postModel";
import { Context } from "../../model/types/Context";
import { User, UserModel } from "../../model/user/userModel";
import { CommentModel } from "../../model/comment/commentModel";
// Constants
import { CREATE_POST_SUCCESS, ERROR, LIKE_POST_SUCCESS,
         DELETE_POST_SUCCESS, DELETE_POST_FAIL, UPDATE_POST_SUCCESS, UPDATE_POST_FAIL, UNLIKE_POST } from "../../utils/constants/postConstants"
// Schema
import { postData } from "../../schema/post/createPost";
// Interface
import { IDefaultResponse, IPostResponse } from "../../model/types/IResponse.model";
import { IUserPayload } from "../../model/types/IUserPayload.model";
import { IPostPayload } from "../../model/types/IPostPayload.model";

export const createPostController = async (postData: postData, context: Context): Promise<IPostResponse> => {
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

export const likePostController = async (postID: string, context: Context): Promise<IPostResponse> => {
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
        ).populate('owner', 'profileName email');
        isLike = false;
    } else {
        result = await PostModel.findOneAndUpdate(
            { _id: _postID },
            {
                $inc: { likes: 1 },
                $addToSet: { listOfLike: user._id }
            },
            { new: true }
        ).populate('owner', 'profileName email');
        isLike = true;
    }
    if (result) {
        if(isLike) return { data: result, response: defaultResponse(true, LIKE_POST_SUCCESS) };
        return { data: result, response: defaultResponse(true, UNLIKE_POST) }
    }
    throw new Error(ERROR);
}

export const getListOfLikesController = async (postID: string): Promise<User[]> => {
    const _postID = mongo.ObjectId(postID);
    const post = await PostModel.findOne({ _id: _postID }).populate('listOfLike');
    if (post) return post.listOfLike;
    return null;
}

export const getAllPostController = async (limit = 5, cursor: string = null): Promise<IPostPayload[]> => {
    if(cursor){
        const _cursorID = mongo.ObjectId(cursor);
        return await PostModel.find({_id: { $lt: _cursorID }})
        .sort({_id: 'desc'})
        .limit(limit)
        .populate('owner', 'profileName email')
        .populate('listOfLike', 'profileName email')
        .populate({ path: 'listOfComment', populate: 'owner' });
    }
    return await PostModel.find({})
        .sort({_id: 'desc'})
        .limit(limit)
        .populate('owner', 'profileName email')
        .populate('listOfLike', 'profileName email')
        .populate({ path: 'listOfComment', populate: 'owner' });
}

export const getPostByIdController = async(id: string): Promise<IPostPayload> => {
    const _postId = mongo.ObjectId(id);
    return await PostModel.findOne({_id: _postId})
        .populate('owner', 'profileName email')
        .populate('listOfLike', 'profileName email')
        .populate({ path: 'listOfComment', populate: 'owner' });
}

export const getPostByOwnerIdController = async (ownerID: string, limit = 5, cursor: string = null): Promise<IPostPayload[]> => {
    const _ownerId = mongo.ObjectId(ownerID);
    if(cursor){
        const _cursorID = mongo.ObjectId(cursor);
        return await PostModel.find({owner: _ownerId, _id: { $lt: _cursorID }})
        .sort({_id: 'desc'})
        .limit(limit)
        .populate('owner', 'profileName email')
        .populate('listOfLike', 'profileName email')
        .populate({ path: 'listOfComment', populate: 'owner' });
    }
    return await PostModel.find({owner: _ownerId}) 
    .sort({_id: 'desc'})
    .limit(limit)
    .populate('owner', 'profileName email')
    .populate('listOfLike', 'profileName email')
    .populate({ path: 'listOfComment', populate: 'owner' });
}

export const deletePostController = async (id: string): Promise<IDefaultResponse> => {
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

export const updatePostController = async (postID: string, newPostContent: string): Promise<IDefaultResponse> => {
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