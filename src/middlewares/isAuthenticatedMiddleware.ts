import { MiddlewareFn } from "type-graphql";
import { Context } from "../model/types/Context";
import { AUTHEN_ERROR, ALREADY_LOGGED_IN } from "../utils/constants/userConstants"

export const isAuthenticated: MiddlewareFn<Context> = async ({ context }, next) => {
    if(!context.req.session.user) throw new Error(AUTHEN_ERROR);
    return next();
}

export const isNotAuthenticated: MiddlewareFn<Context> = async({ context }, next) => {
    if(context.req.session.user) throw new Error(ALREADY_LOGGED_IN);
    return next();
}