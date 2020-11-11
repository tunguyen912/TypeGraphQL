import { mongo } from 'mongoose';
// import redisClient from '../config/Redis.Config';
// Utils
import ResponseUtil from '../utils/Response.utils';
import SecureUtil from '../utils/Secure.utils';
// Model
import { MessageModel } from '../model/Message.Model';
import { UserModel } from '../model/User.Model';
import { Context } from '../model/types/Context';
// Schema
import { messageData } from '../schema/message/Message.Type';
// Constants
import { SEND_MESSAGE_SUCCESS, SEND_MESSAGE_FAIL} from '../utils/constants/Message.Constants';
// Interface
import { IUserPayload, IMessagePayload } from '../model/types/IPayload.model';
import { IMessageResponse } from '../model/types/IResponse.model';

class MessageController{
    private async getConversationIdHelper(fromID: String, toID: String): Promise<string> {
        const _idFrom = mongo.ObjectId(fromID);
        const _idTo = mongo.ObjectId(toID);
        let conversationID: string = `${fromID}-${toID}`;
        if (_idFrom <= _idTo) {
            conversationID = `${toID}-${fromID}`;
        }
        return conversationID;
    }
    public async createMessageController(messageData: messageData, context: Context): Promise<IMessageResponse>{
        const { toUser, messageContent } = messageData;
        const clientDeviceID: string = SecureUtil.getUserClientId(context.req);
        // const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
        const userInfo: IUserPayload = context.req.app.locals[clientDeviceID];
        const from: IUserPayload = await UserModel.findOne({ email: userInfo.email });
        const to: IUserPayload = await UserModel.findOne({ email: toUser });
        const conversationID: string = await this.getConversationIdHelper(from._id, to._id);
        const newMessage = new MessageModel({
            messageFrom: from,
            messageTo: to,
            messageContent,
            conversationID
        })
        let result: IMessagePayload = await newMessage.save();
        if(result) return ResponseUtil.messageResponse(result, ResponseUtil.defaultResponse(true, SEND_MESSAGE_SUCCESS));
        ResponseUtil.messageResponse(null, ResponseUtil.defaultResponse(true, SEND_MESSAGE_FAIL));
    }
    public async getConversationController(context: Context, withUser: string): Promise<IMessagePayload[]>{
        const clientDeviceID: string = SecureUtil.getUserClientId(context.req);
        // const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
        const userInfo: IUserPayload = context.req.app.locals[clientDeviceID];
        const user2: IUserPayload = await UserModel.findOne({ email: withUser });
        const conversationID: string = await this.getConversationIdHelper(userInfo._id, user2._id);
        return await MessageModel.find({ conversationID })
        .populate('messageFrom', 'profileName email')
        .populate('messageTo', 'profileName email');
    }
}
export default new MessageController();

