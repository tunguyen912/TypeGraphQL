import { prop, getModelForClass } from '@typegoose/typegoose';

class User {
  @prop({ required: true })
  firstName: string;

  @prop({ required: true })
  lastName: string;

  @prop({ required: true, unique: true, validate: /\S+@\S+\.\S+/ })
  email: string;
  
  @prop({ required: true})
  password: string;
}
const UserModel = getModelForClass(User);

export {User, UserModel}