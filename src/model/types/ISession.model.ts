import  { IUserPayload } from './IPayload.model'

export interface ISession extends Express.Session {
    user?: IUserPayload
}