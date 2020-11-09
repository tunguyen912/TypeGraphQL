import { ICommentPayload, IPostPayload, IMessagePayload } from "./IPayload.model";

export interface IDefaultResponse {
    isSuccess: boolean,
    message?: string
}

export interface ILoginResponse {
    isSuccess: boolean,
    message?: string,
    jwt?: string
}

export interface IPostResponse {
    data: IPostPayload,
    response: IDefaultResponse
}

export interface ICommentResponse {
    data: ICommentPayload,
    response: IDefaultResponse
}

export interface IMessageResponse {
    data: IMessagePayload,
    response: IDefaultResponse
}