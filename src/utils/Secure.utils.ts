import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as requestIp from 'request-ip';
import * as crypto from 'crypto';
import { Request } from "express";
import { DeviceDetectorResult } from 'device-detector-js';
import DeviceDetector = require('device-detector-js');
// Interface
import { IUserClientData, IClientBrowser, IClientOs, IClientDevice } from '../model/types/IClient.model';
import { IUserPayload } from '../model/types/IPayload.model';


class SecureUtil{
    public async comparePasswordAsync(password: String, hashedPassword: String): Promise<Boolean>{
        return await bcrypt.compare(password, hashedPassword);
    }

    public genJWT = (payload: IUserPayload, secretKey: string, expireTime: string): string =>{
        return jwt.sign(payload, secretKey, { expiresIn: expireTime });
    }

    public async hashPasswordAsync(password: String): Promise<String>{
        return await (bcrypt.hash(password, Number(process.env.BCRYPT_SALT_NUMBER)));
    }

    public getUserClientId = (req: Request): string => {
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
}

export default new SecureUtil();