import { mongo } from 'mongoose';
import redisClient from "../../config/redisConfig";
// Schema
import { commentData } from "../../schema/comment/addComment";
// Utils
import { defaultResponse, getUserClientId } from "../../utils/utils";
// Model
import { Context } from "../../model/types/Context";
import { Post, PostModel } from "../../model/post/postModel";
import { UserModel } from "../../model/user/userModel";
import { CommentModel } from "../../model/comment/commentModel";
// Constants
import { ADD_COMMENT_SUCCESS, DELETE_COMMENT_SUCCESS, DELETE_COMMENT_FAIL } from "../../utils/constants/postConstants";
import { ERROR } from "../../utils/constants/userConstants";
// Interfaces
import { IUserPayload } from "../../model/types/IUserPayload.model";
import { ICommentPayload } from "../../model/types/ICommentPayload.model";
import { IPostResponse } from "../../model/types/IResponse.model";

const createCommentHelper = async (commentContent: String, context: Context): Promise<ICommentPayload> => {
    const clientDeviceID: string = getUserClientId(context.req);
    const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
    const user = await UserModel.findOne({ email: userInfo.email });

    const commentInfo = new CommentModel({
        owner: user,
        content: commentContent
    }) 
    const result = await commentInfo.save();
    if(result) return result;
    throw new Error(ERROR);
}

const addCommentToPostHelper = async (postID: String, comment: ICommentPayload): Promise<Post> => {
    const _postID = mongo.ObjectId(postID);
    const result = await PostModel.findOneAndUpdate(
        { _id: _postID },
        {
            $inc: { comments: 1 },
            $push: { listOfComment: comment._id }
        },
        { new: true }
    );
    if(result) return result;
}

export const updateCommentController = async (id: string, content: string): Promise<ICommentPayload> => {
    const _commentID = mongo.ObjectId(id);
    const result = await CommentModel.findOneAndUpdate(
        { _id: _commentID }, 
        { 
            content, 
            createdAt: Date.now()
        }, 
        { new: true }
    ).populate('owner', 'profileName email');
    return result;
}

export const addCommentController = async (commentData: commentData, context: Context) => {
    const { postID, commentContent } = commentData;
    const comment = await createCommentHelper(commentContent, context);
    const updatedPost = await addCommentToPostHelper(postID, comment);
    if(updatedPost && comment) return {comment, response: defaultResponse(true, ADD_COMMENT_SUCCESS)}
    throw new Error(ERROR);
}

export const deleteCommentController = async (commentID: string, postID: string): Promise<IPostResponse> => {
    const _commentID = mongo.ObjectId(commentID);
    const _postID = mongo.ObjectId(postID);
    // Delete comment from CommentModel
    const deleteComment = await CommentModel.findOneAndDelete({ _id: _commentID });
    // Delete comment from PostModel
    const updatePostComment = await PostModel.findByIdAndUpdate(
        _postID,
        {
            $pull: { listOfComment: _commentID },
            $inc: { comments: -1 },
        },
        { new: true }
    ).populate('owner', 'profileName email')
     .populate('listOfLike', 'profileName email')
     .populate({ path: 'listOfComment', select: 'content createdAt', populate: 'owner'})
    if(updatePostComment && deleteComment) return { data: updatePostComment, response: defaultResponse(true, DELETE_COMMENT_SUCCESS) };
    return {data: null, response: defaultResponse(false, DELETE_COMMENT_FAIL)};
}