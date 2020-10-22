import { UserModel } from '../../model/user/userModel';
import { hashPasswordAsync, comparePasswordAsync, genJWT, logInResponse, defaultResponse } from '../../utils/utils'
import { SIGN_UP_ERROR, DUPLICATE_ERROR, INCORRECT_PASSWORD, LOG_IN_SUCCESS, INCORRECT_EMAIL } from '../../utils/constants/userConstants'
import { IContext } from "../../types/IContext"; 

export async function registerController(registerData) {
    const { firstName, lastName, email, password } = registerData
    try {
        const hashedPassword = await hashPasswordAsync(password);
        const userInfo = new UserModel({
            firstName,
            lastName,
            email,
            password: hashedPassword
        })
        const result = await userInfo.save();
        if (result) return { isSuccess: true };
        return defaultResponse(false, SIGN_UP_ERROR);
    } catch (error) {
        if (error.code === 11000) return defaultResponse(false, DUPLICATE_ERROR);
        return defaultResponse(false, SIGN_UP_ERROR);
    }
}

export async function logInController(logInData, {req}: IContext) {
    const { email, password } = logInData;
    const result = await UserModel.findOne({ email });
    if(result){
        const verifyPasswordStatus = await comparePasswordAsync(password, result.password);
        if(!verifyPasswordStatus) return logInResponse(false, INCORRECT_PASSWORD)
        else { 
            const payload = { 
                userID: result._id,
                email: result.email,
                firstName: result.firstName,
                lastName: result.lastName
            }
            console.log(req)
            //@ts-ignore
            // req.session.user = payload
            const jwt = genJWT(payload, process.env.JWT_SECRET_KEY, '1h');
            return logInResponse(true, LOG_IN_SUCCESS, jwt)
        }
    }
    else return logInResponse(false, INCORRECT_EMAIL);
}
