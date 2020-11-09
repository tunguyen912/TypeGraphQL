import { prop, getModelForClass } from '@typegoose/typegoose';
 
export class User {
  @prop({ required: true })
  firstName: string;

  @prop({ required: true })
  lastName: string;

  @prop({ required: true })
  profileName: string;

  @prop({ required: true, unique: true, validate: /\S+@\S+\.\S+/ })
  email: string;
  
  @prop({ required: true})
  password: string;
}
export const UserModel = getModelForClass(User);
