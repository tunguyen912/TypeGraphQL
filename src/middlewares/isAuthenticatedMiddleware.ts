import { MiddlewareFn } from "type-graphql";
import { Context } from "../model/types/Context";
import { AUTHEN_ERROR, ALREADY_LOGGED_IN } from "../utils/constants/userConstants";

// Redis 
import redisClient from '../config/redisConfig';
import * as redis from 'redis';
import { getUserClientId } from "../utils/utils";
import { IUserPayload } from "../model/types/IUserPayload.model";

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