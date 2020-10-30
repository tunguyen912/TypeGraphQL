import { Message, MessageModel } from '../../model/message/messageModel';
import { defaultResponse } from '../../utils/utils';
import { SEND_MESSAGE_SUCCESS } from '../../utils/constants/messageConstants'
import { ERROR } from '../../utils/constants/messageConstants';
import { Context } from '../../model/types/Context';  
import { ISession } from '../../model/types/ISession.model';
import { UserModel } from '../../model/user/userModel';
import { messageData } from '../../schema//message/createMessage';
import { mongo } from 'mongoose';
import { IUserPayload } from '../../model/types/IUserPayload.model';

export async function createMessageController(messageData: messageData, context: Context) {
    const { toUser, messageContent } = messageData;
    const { email } = context.req.session.user;
    const from = await UserModel.findOne({ email: email });
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

async function getConversationIdHelper(fromID: String, toID: String): Promise<String> {
    const _idFrom = mongo.ObjectId(fromID);
    const _idTo = mongo.ObjectId(toID);
    let conversationID = `${fromID}-${toID}`
    if (_idFrom <= _idTo) {
        conversationID = `${toID}-${fromID}`
    }
    return conversationID;
}

export async function getConversationController(context: Context, withUser: string) {
    const sess: ISession = context.req.session;
    const user1: IUserPayload = sess.user;
    const user2 = await UserModel.findOne({email: withUser});
    const conversationID = await getConversationIdHelper(user1.userID, user2._id);
    return await MessageModel.find({ conversationID });
    // Cannot get user email
}