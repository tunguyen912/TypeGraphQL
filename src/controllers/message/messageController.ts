import redisClient from '../../config/redisConfig';
import { mongo } from 'mongoose';
// Utils
import { defaultResponse, getUserClientId } from '../../utils/utils';
// Model
import { MessageModel } from '../../model/message/messageModel';
import { UserModel } from '../../model/user/userModel';
import { Context } from '../../model/types/Context';
// Schema
import { messageData } from '../../schema//message/createMessage';
// Constants
import { SEND_MESSAGE_SUCCESS } from '../../utils/constants/messageConstants'
import { ERROR } from '../../utils/constants/messageConstants';
// Interface
import { IUserPayload } from '../../model/types/IUserPayload.model';

export const createMessageController = async (messageData: messageData, context: Context) => {
    const { toUser, messageContent } = messageData;
    const clientDeviceID: string = getUserClientId(context.req);
    const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
    const from = await UserModel.findOne({ email: userInfo.email });
    const to = await UserModel.findOne({ email: toUser });
    const conversationID = await getConversationIdHelper(from._id, to._id);
    const newMessage = new MessageModel({
        messageFrom: from,
        messageTo: to,
        messageContent,
        conversationID
    })
    let result = await newMessage.save();
    if(result) return { result, response: defaultResponse(true, SEND_MESSAGE_SUCCESS) }
    throw new Error(ERROR);
}

const getConversationIdHelper = async (fromID: String, toID: String): Promise<String> => {
    const _idFrom = mongo.ObjectId(fromID);
    const _idTo = mongo.ObjectId(toID);
    let conversationID = `${fromID}-${toID}`
    if (_idFrom <= _idTo) {
        conversationID = `${toID}-${fromID}`
    }
    return conversationID;
}

export const getConversationController = async (context: Context, withUser: string) => {
    const clientDeviceID: string = getUserClientId(context.req);
    const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
    const user2 = await UserModel.findOne({email: withUser});
    const conversationID = await getConversationIdHelper(userInfo.userID, user2._id);
    return await MessageModel.find({ conversationID });
    //populate user
}