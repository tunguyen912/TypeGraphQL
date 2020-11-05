import { IClientBrowser } from "./IClientBrowser.model";
import { IClientDevice } from "./IClientDevice.model";
import { IClientOs } from "./IClientOs.model";

export interface IUserClientData {
    ip: string,
    userAgent: string,
    browser: IClientBrowser,
    os: IClientOs,
    device: IClientDevice
}