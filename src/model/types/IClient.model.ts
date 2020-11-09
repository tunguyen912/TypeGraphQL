export interface IUserClientData {
    ip: string,
    userAgent: string,
    browser: IClientBrowser,
    os: IClientOs,
    device: IClientDevice
}

export interface IClientBrowser {
    type: string,
    name: string,
    version: string,
    engine: string,
    engineVersion: string
}

export interface IClientDevice {
    type: string,
    brand: string,
    model: string,
}

export interface IClientOs{
    name: string,
    version: string,
    platform: string
}