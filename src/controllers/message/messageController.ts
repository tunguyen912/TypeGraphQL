import { MessageModel } from '../../model/message/messageModel';
import { defaultResponse } from '../../utils/utils';
import { SEND_MESSAGE_SUCCESS } from '../../utils/constants/messageConstants'
import { ERROR } from '../../utils/constants/messageConstants';
import { Context } from '../../model/types/Context';
import { messageData } from '../../schema/message/createMessage';
import { IDefaultResponse } from '../../model/types/IResponse.model';
import { AUTHEN_ERROR } from '../../utils/constants/userConstants';

export async function createMessageController(messageData: messageData , context: Context): Promise<IDefaultResponse> {
    if(!context.req.session.user){
        return defaultResponse(false, AUTHEN_ERROR)
    }
    const { toUser, messageContent } = messageData;
    const { email } = context.req.session.user;
    const newMessage = new MessageModel({
        messageFrom: email,
        messageTo: toUser,
        messageContent
    })
    let result = await newMessage.save();
    if(result) return defaultResponse(true, SEND_MESSAGE_SUCCESS);
    throw new Error(ERROR);
}

