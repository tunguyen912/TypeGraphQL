import { prop, getModelForClass } from '@typegoose/typegoose';

class Message {
  @prop({ required: true })
  messageFrom?: string;

  @prop({ required: true })
  messageTo?: string;

  @prop({ required: true })
  messageContent?: string;
  
  @prop({ default: Date.now()})
  time?: Date;
}
const MessageModel = getModelForClass(Message);

export {Message, MessageModel}