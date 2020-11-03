import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken'

export async function hashPasswordAsync(password: String): Promise<String>{
    return await (bcrypt.hash(password, Number(process.env.BCRYPT_SALT_NUMBER)));
}

export async function comparePasswordAsync(password: String, hashedPassword: String) {
    return await bcrypt.compare(password, hashedPassword);
}

export const genJWT = (payload, secretKey, expireTime) => {
    return jwt.sign(payload, secretKey, { expiresIn: expireTime })
}

export const defaultResponse = (isSuccess: boolean, message = null) => {
    return {
        isSuccess,
        message
    }
}
export const updatePostResponse = (isSuccess: boolean, message = null, newPostContent = null, updatedAt = null) => {
    return {
        isSuccess,
        message,
        newPostContent,
        updatedAt,
    }
}
export const logInResponse = (isSuccess: boolean, message = null, jwt = null) => {
    return {
        isSuccess,
        message,
        jwt
    }
}