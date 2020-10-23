import { MiddlewareFn } from "type-graphql";
import { Context } from "../model/types/Context";
import { AUTHEN_ERROR } from "../utils/constants/userConstants"

export const isAuthenticated: MiddlewareFn<Context> = async ({ context }, next) => {
    if(!context.req.session.user) throw new Error(AUTHEN_ERROR);
    return next();
}