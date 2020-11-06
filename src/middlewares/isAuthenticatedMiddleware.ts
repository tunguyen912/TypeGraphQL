import { MiddlewareFn } from "type-graphql";
import redisClient from '../config/redisConfig';

// Utils 
import { AUTHEN_ERROR, ALREADY_LOGGED_IN } from "../utils/constants/userConstants";
import { getUserClientId } from "../utils/utils";
// Interface
import { IUserPayload } from "../model/types/IUserPayload.model";
import { Context } from "../model/types/Context";

export const isAuthenticated: MiddlewareFn<Context> = async ({ context }, next) => {
    const clientDeviceID: string = getUserClientId(context.req);
    const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
    if(!userInfo.email) throw new Error(AUTHEN_ERROR);
    return next();
}

export const isNotAuthenticated: MiddlewareFn<Context> = async ({ context }, next) => {
    const clientDeviceID: string = getUserClientId(context.req);
    const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
    if (userInfo) throw new Error(ALREADY_LOGGED_IN);
    return next();
}