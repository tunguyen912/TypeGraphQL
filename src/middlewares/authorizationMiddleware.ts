import { MiddlewareFn } from "type-graphql";
import { Context } from "../model/types/Context";
import * as jwt from 'jsonwebtoken'
import { ISession } from '../model/types/ISession.model';
import { IUserPayload } from "../model/types/IUserPayload.model";
import { AuthenticationError } from "apollo-server-express";
// Redis
import redisClient from '../config/redisConfig';
// import { asyncRedisClient } from '../config/redisConfig';


import * as redis from 'redis';

const generateToken = (payload: IUserPayload): string => {
    const payloadObj: object = {...payload};
    return jwt.sign(payloadObj, process.env.JWT_SECRET_KEY as string, { expiresIn: process.env.TOKEN_EXPIRE_IN });
}

export const authorizationMiddleware: MiddlewareFn<Context> = async({ context }, next) => {
    const jwtReq: string = context.req.headers.authorization;
    const token: string = jwtReq.replace("Bearer ", "");
    // const sess: ISession = context.req.session;
    // const userInfo: IUserPayload = sess.user;
    const deviceId = context.req.headers.deviceid as string;
    // console.log(typeof userInfo2) print object but when I tried to get userInfo2.email, got an error: cannot get email of boolean??????  
    const userInfo2 = await redisClient.hgetall(deviceId) as unknown as IUserPayload;
    
    try {
        const payload: IUserPayload = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        // if(payload.email !== userInfo.email) {
        //     throw new Error('Bad token!')
        // }

        // Using Redis and DiviceId instead of Session
        if(payload.email !== userInfo2.email){
            throw new Error('Bad token!')
        }
        //
        return next()
    } catch(error){
        if(error.name === "TokenExpiredError"){
            console.log('TokenExpiredError');
            const info: any = jwt.decode(token);
            const expTime: number = Date.now() - info.exp * 1000;
            console.log(`Expire Time: ${expTime}`);
            console.log(`Token Info: ${info}`);
            // Using Redis and DiviceId instead of Session
            if(expTime < 60*60*1000 && info.email === userInfo2.email && token === userInfo2.token){
                console.log('Token refreshed');
                const payload: any = {
                    email: info.email,
                    firstName: info.firstName,
                    lastName: info.lastName,
                };
                const newToken: string = await generateToken(payload);
                redisClient.hmset(deviceId, 'email', info.email, 'firstName', info.firstName, 'lastName', info.lastName, 'token', newToken);  
                context.res.set('Access-Control-Expose-Headers','x-refresh-token');
                context.res.set('x-refresh-token', newToken);
                console.log(context.res);
            }   
            //
            // if(expTime < 60*60*1000 && info.email === userInfo.email && token === userInfo.token){
            //     console.log("Token refreshed");
            //     const payload: any = {
            //         userID: info.userID,
            //         email: info.email,
            //         firstName: info.firstName,
            //         lastName: info.lastName,
            //     };
            //     const newToken: string = await generateToken(payload);
            //     userInfo.token = newToken;
            //     context.res.set('Access-Control-Expose-Headers','x-refresh-token');
            //     context.res.set('x-refresh-token', newToken);
            //     console.log(context.res);
            // }
        }
        throw new AuthenticationError(error.name);
    }
}