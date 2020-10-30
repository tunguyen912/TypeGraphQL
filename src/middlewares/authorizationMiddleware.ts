import { MiddlewareFn } from "type-graphql";
import { Context } from "../model/types/Context";
import * as jwt from 'jsonwebtoken'
import { ISession } from '../model/types/ISession.model';
import { IUserPayload } from "../model/types/IUserPayload.model";
import { AuthenticationError } from "apollo-server-express";

export const authorizationMiddleware: MiddlewareFn<Context> = async({ context }, next) => {
    try {
        const jwtReq = context.req.headers.authorization;
        const token = jwtReq.replace("Bearer ", "");
        const payload = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        const sess: ISession = context.req.session
        const userInfo: IUserPayload = sess.user
        if(payload.email !== userInfo.email) {
            throw new Error('Bad token!')
        }
        return next()
    } catch(error){
        throw new AuthenticationError(error.message)
    }
}