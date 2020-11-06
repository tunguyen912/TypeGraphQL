import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken'
import { IUserPayload } from '../model/types/IUserPayload.model';
import { DeviceDetectorResult } from 'device-detector-js';
import { Request } from "express";
import * as requestIp from 'request-ip';
import DeviceDetector = require('device-detector-js');
import * as crypto from 'crypto';
import { IClientBrowser } from '../model/types/IClientBrowser.model';
import { IClientOs } from '../model/types/IClientOs.model';
import { IClientDevice } from '../model/types/IClientDevice.model';
import { IUserClientData } from '../model/types/IUserClientData.model';
import { IDefaultResponse, ILoginResponse } from '../model/types/IResponse.model';

export const hashPasswordAsync = async(password: String): Promise<String> => {
    return await (bcrypt.hash(password, Number(process.env.BCRYPT_SALT_NUMBER)));
}

export const comparePasswordAsync = async (password: String, hashedPassword: String): Promise<Boolean> => {
    return await bcrypt.compare(password, hashedPassword);
}

export const genJWT = (payload: IUserPayload, secretKey: string, expireTime: string): string => {
    return jwt.sign(payload, secretKey, { expiresIn: expireTime })
}

export const defaultResponse = (isSuccess: boolean, message = null): IDefaultResponse => {
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
export const logInResponse = (isSuccess: boolean, message = null, jwt = null): ILoginResponse => {
    return {
        isSuccess,
        message,
        jwt
    }
}

export const getUserClientId = (req: Request): string => {
    const deviceDetector = new DeviceDetector();
    const deviceDetail: DeviceDetectorResult = deviceDetector.parse(req.headers['user-agent'] as string);
    const userClientData: IUserClientData = {
      ip: requestIp.getClientIp(req) as string,
      userAgent: req.headers['user-agent'] as string,
      browser: deviceDetail.client as IClientBrowser,
      os: deviceDetail.os as IClientOs,
      device: deviceDetail.device as IClientDevice,
    };
    const hashUserClientData: string = crypto.createHash('sha256').update(JSON.stringify(userClientData)).digest('hex');
    return hashUserClientData;
}