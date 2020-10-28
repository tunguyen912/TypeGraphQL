import { User, UserModel } from '../../model/user/userModel';
import { hashPasswordAsync, comparePasswordAsync, genJWT, logInResponse, defaultResponse } from '../../utils/utils'
import { SIGN_UP_ERROR, DUPLICATE_ERROR, INCORRECT_EMAIL_OR_PASSWORD, LOG_IN_SUCCESS, INVALID_EMAIL_TYPE, REGISTER_SUCCESS, LOG_OUT_SUCCESS, ALREADY_LOG_IN } from '../../utils/constants/userConstants'
import { Context } from "../../model/types/Context"; 
import { ISession } from '../../model/types/ISession.model';
import { IPayload } from '../../model/types/IPayload.model'
import { IDefaultResponse, ILoginResponse } from '../../model/types/IResponse.model';
import { mongo } from 'mongoose';
import { registerData } from '../../schema/user/registerSchema';
import { loginData } from '../../schema/user/loginSchema';




export async function registerController(registerData: registerData): Promise<IDefaultResponse> {
    const { firstName, lastName, email, password } = registerData
    try {
        const hashedPassword = await hashPasswordAsync(password);
        const userInfo = new UserModel({
            firstName,
            lastName,
            email,
            password: hashedPassword
        })
        const result = await userInfo.save();
        if (result) return defaultResponse(true, REGISTER_SUCCESS);
        return defaultResponse(false, SIGN_UP_ERROR);
    } catch (error) {
        if (error.code === 11000) return defaultResponse(false, DUPLICATE_ERROR);
        if (error._message === 'User validation failed') return defaultResponse(false, INVALID_EMAIL_TYPE);
        return defaultResponse(false, SIGN_UP_ERROR);
    }
}

export async function logInController(logInData: loginData, context: Context): Promise<ILoginResponse> {
    if(context.req.session.user){
        return logInResponse(false, ALREADY_LOG_IN)
    } else {
        const { email, password } = logInData;
        const result = await UserModel.findOne({ email });
        if(result){
            const verifyPasswordStatus = await comparePasswordAsync(password, result.password);
            if(!verifyPasswordStatus) return logInResponse(false, INCORRECT_EMAIL_OR_PASSWORD)
            else { 
                const sess = context.req.session as ISession;
                const payload: IPayload = {
                    userID: result._id,
                    email: result.email,
                    firstName: result.firstName,
                    lastName: result.lastName
                };
                //////////////////////////
                sess.user = payload;
                //////////////////////////
                const jwt = genJWT(payload, process.env.JWT_SECRET_KEY, '1h');
                return logInResponse(true, LOG_IN_SUCCESS, jwt)
            }
        }
        else return logInResponse(false, INCORRECT_EMAIL_OR_PASSWORD);
    }
}

export async function logOutController(context: Context): Promise<IDefaultResponse> {
    await context.req.session.destroy((error) => {
        return defaultResponse(false, error)
    });
    return defaultResponse(true, LOG_OUT_SUCCESS)
}

export async function findUserController(email: string): Promise<User> {
    return await UserModel.findOne({ email },{ email });
}

export async function findUserByIdController(userID: string): Promise<User> {
    const _userID = mongo.ObjectId(userID)
    return await UserModel.findOne({ _id: _userID });
}

export async function findMeController(context: Context): Promise<User> {
    const sess: ISession = context.req.session;
    return await findUserByIdController(sess.user.userID)
}