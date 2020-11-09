import { MiddlewareFn } from "type-graphql";
import redisClient from '../config/Redis.Config';
// Utils 
import { AUTHEN_ERROR, ALREADY_LOGGED_IN } from "../utils/constants/User.Constants";
import SecureUtil from "../utils/Secure.utils";
// Interface
import { IUserPayload } from "../model/types/IPayload.model";
import { Context } from "../model/types/Context";

export const isAuthenticated: MiddlewareFn<Context> = async ({ context }, next) => {
    const clientDeviceID: string = SecureUtil.getUserClientId(context.req);
    const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
    if(!userInfo.email) throw new Error(AUTHEN_ERROR);
    return next();
}

export const isNotAuthenticated: MiddlewareFn<Context> = async ({ context }, next) => {
    const clientDeviceID: string = SecureUtil.getUserClientId(context.req);
    const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
    if (userInfo) throw new Error(ALREADY_LOGGED_IN);
    return next();
}