import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import { User } from '../user/userModel';

export class Message {
  @prop({ required: true, ref: 'User' })
  messageFrom: Ref<User>;

  @prop({ required: true, ref: 'User' })
  messageTo: Ref<User>;

  @prop({ required: true })
  messageContent: string;
  
  @prop({ default: Date.now })
  createdAt: Date;

  @prop({ required: true })
  conversationID: string;
}
export const MessageModel = getModelForClass(Message);
