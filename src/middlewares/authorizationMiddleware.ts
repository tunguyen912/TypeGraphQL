import { MiddlewareFn } from "type-graphql";
import * as jwt from 'jsonwebtoken'
import redisClient from '../config/Redis.Config';
import { AuthenticationError } from "apollo-server-express";
// Model
import { Context } from "../model/types/Context";
import { IUserPayload } from "../model/types/IPayload.model";
// Utils
import SecureUtil from "../utils/Secure.utils";
import { BAD_TOKEN, TOKEN_EXPIRED_ERROR } from "../utils/constants/Error.Constants";

export const authorizationMiddleware: MiddlewareFn<Context> = async({ context }, next) => {
    const jwtReq: string = context.req.headers.authorization;
    const token: string = jwtReq.replace("Bearer ", "");
    const clientDeviceID: string = SecureUtil.getUserClientId(context.req);  
    // const userInfo = await redisClient.hgetall(clientDeviceID) as unknown as IUserPayload;
    const userInfo: IUserPayload = context.req.app.locals[clientDeviceID];
    try {
        const payload: IUserPayload = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        if(payload.email !== userInfo.email){
            throw new Error(BAD_TOKEN);
        }
        return next();
    } catch(error){
        if(error.name === TOKEN_EXPIRED_ERROR){
            console.log(TOKEN_EXPIRED_ERROR);
            const info: any = jwt.decode(token);
            const expTime: number = Date.now() - info.exp * 1000;
            console.log(expTime);
            if(expTime < 60*60*1000 && info.email === userInfo.email && token === userInfo.token){
                console.log('Token refreshed');
                const payload: IUserPayload = {
                    email: info.email,
                    firstName: info.firstName,
                    lastName: info.lastName,
                };
                const newToken: string = SecureUtil.genJWT(payload, process.env.JWT_SECRET_KEY, process.env.TOKEN_EXPIRE_IN);
                context.req.app.locals[clientDeviceID].token = newToken;
                redisClient.hmset(clientDeviceID, 'email', info.email, 'firstName', info.firstName, 'lastName', info.lastName, 'token', newToken); 
                redisClient.expire(clientDeviceID, Number(process.env.REDIS_EXPIRE_TIME)); 
                context.res.set('Access-Control-Expose-Headers','x-refresh-token');
                context.res.set('x-refresh-token', newToken);
                console.log(context.res);
            } else{
                delete context.req.app.locals[clientDeviceID];  
            }  
        }
        throw new AuthenticationError(error.message);
    }
}