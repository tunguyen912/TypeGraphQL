import { MiddlewareFn } from "type-graphql";
import { Context } from "../model/types/Context";
import { AUTHEN_ERROR, ALREADY_LOGGED_IN, DEVICE_ID_NOT_FOUND } from "../utils/constants/userConstants";

// Redis 
import redisClient from '../config/redisConfig';
import * as redis from 'redis';

export const isAuthenticated: MiddlewareFn<Context> = async ({ context }, next) => {
    // if (!context.req.session.user) throw new Error(AUTHEN_ERROR);

    // Using Redis and DiviceId instead of Session
    const deviceId = context.req.headers.deviceid as string;
    if (deviceId === undefined) { 
        throw new Error(DEVICE_ID_NOT_FOUND); 
    } else {
        const userInfo = await redisClient.hgetall(deviceId);
        if (!userInfo) throw new Error(AUTHEN_ERROR);
    }
    //
    return next();
}

export const isNotAuthenticated: MiddlewareFn<Context> = async ({ context }, next) => {
    if (context.req.session.user) throw new Error(ALREADY_LOGGED_IN);
    return next();
}