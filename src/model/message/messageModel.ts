import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import { User } from '../user/userModel';

class Message {
  // @prop({ required: true, ref: 'User' })
  // messageFrom: Ref<User>;

  // @prop({ required: true, ref: 'User' })
  // messageTo: Ref<User>;
  @prop({ required: true })
  messageFrom: string; 

  @prop({ required: true })
  messageTo: string;

  @prop({ required: true })
  messageContent: string;
  
  @prop({ default: Date.now()})
  time: Date;
}
const MessageModel = getModelForClass(Message);

export {Message, MessageModel}