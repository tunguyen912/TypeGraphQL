import { mongo } from 'mongoose';
import redisClient from '../../config/redisConfig';  
// Utils
import { hashPasswordAsync, comparePasswordAsync, genJWT, logInResponse, defaultResponse, getUserClientId } from '../../utils/utils';
// Constants
import {
    SIGN_UP_ERROR, DUPLICATE_ERROR, INCORRECT_EMAIL_OR_PASSWORD, LOG_IN_SUCCESS, INVALID_EMAIL_TYPE,
    REGISTER_SUCCESS, LOG_OUT_SUCCESS, INVALID_USER
} from '../../utils/constants/userConstants';
// Model
import { Context } from "../../model/types/Context";
import { IUserPayload } from '../../model/types/IUserPayload.model';
import { IDefaultResponse, ILoginResponse } from '../../model/types/IResponse.model';
import { User, UserModel } from '../../model/user/userModel';
// Schema
import { registerData } from '../../schema/user/registerSchema';
import { loginData } from '../../schema/user/loginSchema';
// import app from '../../app'

export const registerController = async (registerData: registerData): Promise<IDefaultResponse> => {
    const { firstName, lastName, email, password } = registerData
    try {
        const hashedPassword = await hashPasswordAsync(password);
        const userInfo = new UserModel({
            firstName,
            lastName,
            email,
            profileName: `${firstName} ${lastName}`,
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

export const logInController = async (logInData: loginData, context: Context): Promise<ILoginResponse> => {
    const { email, password } = logInData;
    const result = await UserModel.findOne({ email });
    if (result) {
        const verifyPasswordStatus: Boolean = await comparePasswordAsync(password, result.password);
        if (!verifyPasswordStatus) return logInResponse(false, INCORRECT_EMAIL_OR_PASSWORD);
        else {
            const payload: IUserPayload = {
                userID: result._id,
                email: result.email,
                firstName: result.firstName,
                lastName: result.lastName,
            };
            const jwt: string = genJWT(payload, process.env.JWT_SECRET_KEY, process.env.TOKEN_EXPIRE_IN);
            const clientDeviceID: string = getUserClientId(context.req);
            redisClient.hmset(clientDeviceID, 'email', result.email, 'firstName', result.firstName, 'lastName', result.lastName, 'token', jwt);
            redisClient.expire(clientDeviceID, Number(process.env.REDIS_EXPIRE_TIME));
               
            // Save userpayload into global var.
            // app.locals.userData = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
            return logInResponse(true, LOG_IN_SUCCESS, jwt)
        }
    }
    return logInResponse(false, INCORRECT_EMAIL_OR_PASSWORD);
}

export const logOutController = async (context: Context): Promise<IDefaultResponse> => {
    const clientDeviceID: string = getUserClientId(context.req);
    const result = await redisClient.hdel(clientDeviceID, 'email', 'firstName', 'lastName', 'token');
    // delete app.locals.userData;
    if(result) return defaultResponse(true, LOG_OUT_SUCCESS)
    return defaultResponse(false, INVALID_USER)
}

export const findUserController = async (email: string): Promise<User> => {
    return await UserModel.findOne({ email });
}

export const findUserByIdController = async (userID: string): Promise<User> => {
    const _userID = mongo.ObjectId(userID)
    return await UserModel.findOne({ _id: _userID });
}

export const findMeController = async (context: Context): Promise<User> => {
    const clientDeviceID: string = getUserClientId(context.req);
    const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
    // const userInfo = app.locals.userData;
    return await findUserController(userInfo.email);
}