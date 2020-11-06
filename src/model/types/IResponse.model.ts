import { IPostPayload } from "./IPostPayload.model";

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