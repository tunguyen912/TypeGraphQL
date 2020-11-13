import { mongo } from 'mongoose';
// import redisClient from '../config/Redis.Config';
// Utils
import ResponseUtil from "../utils/Response.utils";
import SecureUtil from '../utils/Secure.utils';
// Model
import { PostModel } from "../model/Post.Model";
import { Context } from "../model/types/Context";
import { User, UserModel } from "../model/User.Model";
import { CommentModel } from "../model/Comment.Model";
// Constants
import {
    CREATE_POST_SUCCESS, LIKE_POST_SUCCESS, DELETE_POST_SUCCESS, DELETE_POST_FAIL,
    UPDATE_POST_SUCCESS, UPDATE_POST_FAIL, UNLIKE_POST, POST_NOT_FOUND, CREATE_POST_FAIL, LIKE_POST_FAIL
} from "../utils/constants/Post.Constants";
import { PERMISSION_ERROR } from '../utils/constants/Error.Constants';
// Schema
import { postData } from "../schema/post/Post.Type";
// Interface
import { IDefaultResponse, IPostResponse, ILikePostResponse } from "../model/types/IResponse.model";
import { IUserPayload, IPostPayload } from "../model/types/IPayload.model";

class PostController {
    public async createPostController(postData: postData, context: Context): Promise<IPostResponse> {
        const { postContent } = postData;
        // const userInfo: IUserPayload = context.req.app.locals.userData;
        const clientDeviceID: string = SecureUtil.getUserClientId(context.req);
        // const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
        const userInfo: IUserPayload = context.req.app.locals[clientDeviceID];
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
        if (newPost) return ResponseUtil.postResponse(result, ResponseUtil.defaultResponse(true, CREATE_POST_SUCCESS));
        return ResponseUtil.postResponse(null, ResponseUtil.defaultResponse(true, CREATE_POST_FAIL))
    }
    public async likePostController(postID: string, context: Context): Promise<ILikePostResponse> {
        const clientDeviceID: string = SecureUtil.getUserClientId(context.req);
        // const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
        const userInfo: IUserPayload = context.req.app.locals[clientDeviceID];
        const _postID = mongo.ObjectId(postID);
        const post: IPostPayload = await PostModel.findOne({ _id: _postID });
        const user = await UserModel.findOne({ email: userInfo.email });
        let result: IPostPayload, isLike: boolean;
        if (post.listOfLike.includes(user._id)) {
            result = await PostModel.findOneAndUpdate(
                { _id: _postID },
                {
                    $inc: { likes: -1 },
                    $pull: { listOfLike: user._id }
                },
                { new: true }
            ).populate('owner', 'profileName email')
             .populate('listOfLike', 'profileName email');
            isLike = false;
        } else {
            result = await PostModel.findOneAndUpdate(
                { _id: _postID },
                {
                    $inc: { likes: 1 },
                    $addToSet: { listOfLike: user._id }
                },
                { new: true }
            ).populate('owner', 'profileName email')
             .populate('listOfLike', 'profileName email');
            isLike = true;
        }
        if (result) {
            if (isLike) return ResponseUtil.likeResponse(result, isLike, ResponseUtil.defaultResponse(true, LIKE_POST_SUCCESS));
            return ResponseUtil.likeResponse(result, isLike, ResponseUtil.defaultResponse(true, UNLIKE_POST));
        }
        return ResponseUtil.likeResponse(null, null, ResponseUtil.defaultResponse(true, LIKE_POST_FAIL));
    }
    public async getListOfLikesController(postID: string): Promise<User[]> {
        const _postID = mongo.ObjectId(postID);
        const post: IPostPayload = await PostModel.findOne({ _id: _postID }).populate('listOfLike');
        if (post) return post.listOfLike;
        return null;
    }
    public async getAllPostController(limit: number, cursor: string = null): Promise<IPostPayload[]> {
        if (cursor) {
            const _cursorID = mongo.ObjectId(cursor);
            return await PostModel.find({ _id: { $lt: _cursorID } })
                .sort({ _id: 'desc' })
                .limit(limit)
                .populate('owner', 'profileName email')
                .populate('listOfLike', 'profileName email')
                .populate({ path: 'listOfComment', populate: 'owner' });
        }
        return await PostModel.find({})
            .sort({ _id: 'desc' })
            .limit(limit)
            .populate('owner', 'profileName email')
            .populate('listOfLike', 'profileName email')
            .populate({ path: 'listOfComment', populate: 'owner' });
    }
    public async getPostByIdController(id: string): Promise<IPostPayload> {
        const _postId = mongo.ObjectId(id);
        return await PostModel.findOne({ _id: _postId })
            .populate('owner', 'profileName email')
            .populate('listOfLike', 'profileName email')
            .populate({ path: 'listOfComment', populate: 'owner' });
    }
    // new
    public async getPostNumber(ownerID: string = null): Promise<Number>{
        if(ownerID) {
            const _ownerId = mongo.ObjectId(ownerID);
            return  PostModel.countDocuments({ owner: _ownerId });
        }
        return PostModel.countDocuments();
    }

    public async getPostByOwnerIdController(ownerID: string, limit: number, cursor: string = null): Promise<IPostPayload[]> {
        const _ownerId = mongo.ObjectId(ownerID);
        if (cursor) {
            const _cursorID = mongo.ObjectId(cursor);
            return await PostModel.find({ owner: _ownerId, _id: { $lt: _cursorID } })
                .sort({ _id: 'desc' })
                .limit(limit)
                .populate('owner', 'profileName email')
                .populate('listOfLike', 'profileName email')
                .populate({ path: 'listOfComment', populate: 'owner' });
        }
        return await PostModel.find({ owner: _ownerId })
            .sort({ _id: 'desc' })
            .limit(limit)
            .populate('owner', 'profileName email')
            .populate('listOfLike', 'profileName email')
            .populate({ path: 'listOfComment', populate: 'owner' });
    }
    public async deletePostController(id: string, context: Context): Promise<IDefaultResponse> {
        const _id = mongo.ObjectId(id);
        const clientDeviceID: string = SecureUtil.getUserClientId(context.req);
        const userInfo: IUserPayload = context.req.app.locals[clientDeviceID];
        const postToDelete = await PostModel.findOne({ _id });
        if (!postToDelete) ResponseUtil.defaultResponse(false, POST_NOT_FOUND);
        if (postToDelete.owner.toString() !== userInfo._id.toString()) {
            return ResponseUtil.defaultResponse(false, PERMISSION_ERROR);
        }
        const deletePost = await postToDelete.delete();
        const listOfComment = postToDelete.listOfComment;
        const deleteComment = await CommentModel.deleteMany({
            _id: { $in: listOfComment }
        });
        if (deleteComment && deletePost) return ResponseUtil.defaultResponse(true, DELETE_POST_SUCCESS);
        return ResponseUtil.defaultResponse(false, DELETE_POST_FAIL);
    }
    public async updatePostController(postID: string, newPostContent: string, context: Context): Promise<IPostResponse> {
        const _postID = mongo.ObjectId(postID);
        const clientDeviceID: string = SecureUtil.getUserClientId(context.req);
        // const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
        const userInfo: IUserPayload = context.req.app.locals[clientDeviceID];
        const post = await PostModel.findOne({ _id: _postID });
        
        if (!post) return ResponseUtil.postResponse(null, ResponseUtil.defaultResponse(false, POST_NOT_FOUND));
        if (post.owner.toString() !== userInfo._id.toString()) {
            return ResponseUtil.postResponse(null, ResponseUtil.defaultResponse(false, PERMISSION_ERROR));
        }

        const result: IPostPayload = await PostModel.findOneAndUpdate(
            { _id: _postID },
            {
                content: newPostContent,
                createdAt: Date.now()
            },
            { new: true }
        ).populate('owner', 'profileName email')
         .populate('listOfLike', 'profileName email')
         .populate({ path: 'listOfComment', populate: 'owner' });
        if (result) return ResponseUtil.postResponse(result, ResponseUtil.defaultResponse(false, UPDATE_POST_SUCCESS));
        return ResponseUtil.postResponse(null, ResponseUtil.defaultResponse(false, UPDATE_POST_FAIL));
    }

}
export default new PostController();