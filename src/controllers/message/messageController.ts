import { Message, MessageModel } from '../../model/message/messageModel';
import { defaultResponse } from '../../utils/utils';
import { SEND_MESSAGE_SUCCESS } from '../../utils/constants/messageConstants'
import { ERROR } from '../../utils/constants/messageConstants';
import { Context } from '../../model/types/Context';
import { messageData } from '../../schema/message/createMessage';   
import { IDefaultResponse } from '../../model/types/IResponse.model';
import { AUTHEN_ERROR } from '../../utils/constants/userConstants';
import { ISession } from '../../model/types/ISession.model';
import { UserModel } from '../../model/user/userModel';

export async function createMessageController(messageData: messageData, context: Context): Promise<IDefaultResponse> {
    const { toUser, messageContent } = messageData;
    const { email } = context.req.session.user;
    const newMessage = new MessageModel({
        messageFrom: await UserModel.findOne({ email: email }),
        messageTo: await UserModel.findOne({ email: toUser }),
        messageContent
    })
    let result = await newMessage.save();
    if(result) return defaultResponse(true, SEND_MESSAGE_SUCCESS);
    throw new Error(ERROR);
}

export async function getMessageController(context: Context): Promise<Message> {
    const sess: ISession = context.req.session
    const user = await UserModel.findOne({ email: sess.user.email })
    const result = await MessageModel.find({ messageFrom: user })

    return result
}