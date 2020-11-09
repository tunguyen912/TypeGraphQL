import { mongo } from 'mongoose';
import redisClient from "../config/Redis.Config";
// Schema
import { commentData } from "../schema/comment/Comment.Type";
// Utils
import ResponseUtil from "../utils/Response.utils";
import SecureUtil from '../utils/Secure.utils';
// Model
import { Context } from "../model/types/Context";
import { Post, PostModel } from "../model/Post.Model";
import { UserModel } from "../model/User.Model";
import { CommentModel } from "../model/Comment.Model";
// Constants
import { ADD_COMMENT_SUCCESS, DELETE_COMMENT_SUCCESS, DELETE_COMMENT_FAIL, UPDATE_COMMENT_SUCCESS, UPDATE_COMMENT_FAIL } from "../utils/constants/Comment.Constants";
import { ERROR, PERMISSION_ERROR } from "../utils/constants/Error.Constants";
// Interfaces
import { IUserPayload, IPostPayload, ICommentPayload } from "../model/types/IPayload.model";
import { ICommentResponse, IPostResponse } from "../model/types/IResponse.model";

const createCommentHelper = async (commentContent: String, context: Context): Promise<ICommentPayload> => {
    const clientDeviceID: string = SecureUtil.getUserClientId(context.req);
    const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
    const user: IUserPayload = await UserModel.findOne({ email: userInfo.email });
    const commentInfo = new CommentModel({
        owner: user,
        content: commentContent
    });
    const result: ICommentPayload = await commentInfo.save();
    if(result) return result;
    throw new Error(ERROR);
}

const addCommentToPostHelper = async (postID: String, comment: ICommentPayload): Promise<Post> => {
    const _postID = mongo.ObjectId(postID);
    const result: IPostPayload = await PostModel.findOneAndUpdate(
        { _id: _postID },
        {
            $inc: { comments: 1 },
            $push: { listOfComment: comment._id }
        },
        { new: true }
    );
    if(result) return result;
}

export const updateCommentController = async (id: string, content: string, context: Context): Promise<ICommentResponse> => {
    const _commentID = mongo.ObjectId(id);
    const clientDeviceID: string = SecureUtil.getUserClientId(context.req);
    const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
    const comment = await CommentModel.findOne({ _id: _commentID });

    if(comment.owner.toString() !== userInfo._id){
        return ResponseUtil.postResponse(null, ResponseUtil.defaultResponse(false, PERMISSION_ERROR));
    }
    const result = await comment.update(
        { 
            content, 
            createdAt: Date.now()
        }, 
        { new: true }
    ).populate('owner', 'profileName email');
    if(result) return ResponseUtil.commentResponse(result, ResponseUtil.defaultResponse(true, UPDATE_COMMENT_SUCCESS));
    return ResponseUtil.postResponse(null, ResponseUtil.defaultResponse(false, UPDATE_COMMENT_FAIL));

}

export const addCommentController = async (commentData: commentData, context: Context): Promise<ICommentResponse> => {
    const { postID, commentContent } = commentData;
    const comment = await createCommentHelper(commentContent, context);
    const updatedPost = await addCommentToPostHelper(postID, comment);
    if(updatedPost && comment) return ResponseUtil.commentResponse(comment, ResponseUtil.defaultResponse(true, ADD_COMMENT_SUCCESS));
    throw new Error(ERROR);
}

export const deleteCommentController = async (commentID: string, postID: string, context: Context): Promise<IPostResponse> => {
    const clientDeviceID: string = SecureUtil.getUserClientId(context.req);
    const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
    const _commentID = mongo.ObjectId(commentID);
    const _postID = mongo.ObjectId(postID);
    const deleteComment = await CommentModel.findOne({ _id: _commentID });
    if(deleteComment.owner.toString() !== userInfo._id){
        return ResponseUtil.postResponse(null, ResponseUtil.defaultResponse(false, PERMISSION_ERROR));
    }
    await deleteComment.delete();
    const updatePostComment = await PostModel.findByIdAndUpdate(
        _postID,
        {
            $pull: { listOfComment: _commentID },
            $inc: { comments: -1 },
        },
        { new: true }
    ).populate('owner', 'profileName email')
     .populate('listOfLike', 'profileName email')
     .populate({ path: 'listOfComment', select: 'content createdAt', populate: 'owner'});
    if(updatePostComment) return ResponseUtil.postResponse(updatePostComment, ResponseUtil.defaultResponse(true, DELETE_COMMENT_SUCCESS));
    return ResponseUtil.postResponse(null, ResponseUtil.defaultResponse(false, DELETE_COMMENT_FAIL));
}