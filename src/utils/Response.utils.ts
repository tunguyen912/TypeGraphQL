
import { ICommentResponse, IDefaultResponse, ILoginResponse, IMessageResponse, IPostResponse } from '../model/types/IResponse.model';
import { IPostPayload, ICommentPayload, IMessagePayload } from '../model/types/IPayload.model';

class ResponseUtil{
    public defaultResponse = (isSuccess: boolean, message = null): IDefaultResponse => {
        return {
            isSuccess,
            message
        }
    }

    // public updatePostResponse = (isSuccess: boolean, message = null, newPostContent = null, updatedAt = null) => {
    //     return {
    //         isSuccess,
    //         message,
    //         newPostContent,
    //         updatedAt,
    //     }
    // }
    
    public logInResponse = (isSuccess: boolean, message = null, jwt = null): ILoginResponse => {
        return {
            isSuccess,
            message,
            jwt
        }
    }
    
    public postResponse = (data: IPostPayload, response: IDefaultResponse): IPostResponse => {
        return{
            data,
            response
        }
    }
    
    public commentResponse = (data: ICommentPayload, response: IDefaultResponse): ICommentResponse => {
        return {
            data,
            response
        }
    }

    public messageResponse = (data: IMessagePayload, response: IDefaultResponse): IMessageResponse => {
        return {
            data,
            response
        }
    }
}

export default new ResponseUtil();