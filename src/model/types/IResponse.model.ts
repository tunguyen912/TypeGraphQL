export interface IDefaultResponse {
    isSuccess: boolean,
    message?: string
}

export interface ILoginResponse {
    isSuccess: boolean,
    message?: string,
    jwt?: string
}