import { MiddlewareFn } from "type-graphql";
import * as jwt from 'jsonwebtoken'
import redisClient from '../config/Redis.Config';
import { AuthenticationError } from "apollo-server-express";
// Model
import { Context } from "../model/types/Context";
import { IUserPayload } from "../model/types/IPayload.model";
// Utils
import SecureUtil from "../utils/Secure.utils";
import { BAD_TOKEN } from "../utils/constants/Error.Constants";

const generateToken = (payload: IUserPayload): string => {
    const payloadObj: object = {...payload};
    return jwt.sign(payloadObj, process.env.JWT_SECRET_KEY as string, { expiresIn: process.env.TOKEN_EXPIRE_IN });
}

export const authorizationMiddleware: MiddlewareFn<Context> = async({ context }, next) => {
    const jwtReq: string = context.req.headers.authorization;
    const token: string = jwtReq.replace("Bearer ", "");
    const clientDeviceID: string = SecureUtil.getUserClientId(context.req);  
    const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
    
    try {
        const payload: IUserPayload = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        if(payload.email !== userInfo.email){
            throw new Error(BAD_TOKEN);
        }
        return next()
    } catch(error){
        if(error.name === "TokenExpiredError"){
            console.log('TokenExpiredError');
            const info: any = jwt.decode(token);
            const expTime: number = Date.now() - info.exp * 1000;
            if(expTime < 60*60*1000 && info.email === userInfo.email && token === userInfo.token){
                console.log('Token refreshed');
                const payload: any = {
                    email: info.email,
                    firstName: info.firstName,
                    lastName: info.lastName,
                };
                const newToken: string = generateToken(payload);
                await redisClient.hdel(clientDeviceID, '_id', 'email', 'firstName', 'lastName', 'token');
                redisClient.hmset(clientDeviceID, 'email', info.email, 'firstName', info.firstName, 'lastName', info.lastName, 'token', newToken); 
                redisClient.expire(clientDeviceID, Number(process.env.REDIS_EXPIRE_TIME)); 
                context.res.set('Access-Control-Expose-Headers','x-refresh-token');
                context.res.set('x-refresh-token', newToken);
                console.log(context.res);
            }   
        }
        throw new AuthenticationError(error.message);
    }
}