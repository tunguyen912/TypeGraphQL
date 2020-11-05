import { Context } from "../../model/types/Context";
import { ISession } from "../../model/types/ISession.model";
import { commentData } from "../../schema/comment/addComment";
import { mongo } from 'mongoose';
import { Post, PostModel } from "../../model/post/postModel";
import { UserModel } from "../../model/user/userModel";
import { ERROR } from "../../utils/constants/userConstants";
import { defaultResponse, getUserClientId } from "../../utils/utils";
import { Comment, CommentModel } from "../../model/comment/commentModel";
import { ADD_COMMENT_SUCCESS, DELETE_COMMENT_SUCCESS, DELETE_COMMENT_FAIL } from "../../utils/constants/postConstants";
import redisClient from "../../config/redisConfig";
import { IUserPayload } from "../../model/types/IUserPayload.model";

async function createCommentHelper(commentContent: String, context: Context): Promise<Comment> {
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

async function addCommentToPostHelper(postID: String, comment): Promise<Post> {
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

export async function addCommentController(commentData: commentData, context: Context) {
    const { postID, commentContent } = commentData;
    const comment = await createCommentHelper(commentContent, context);
    const updatedPost = await addCommentToPostHelper(postID, comment);
    if(updatedPost && comment) return {comment, updatedPost, response: defaultResponse(true, ADD_COMMENT_SUCCESS)}
    throw new Error(ERROR);
}


export async function updateCommentController(id: string, content: string) {
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

export async function deleteCommentController(commentID: string, postID: string) {
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