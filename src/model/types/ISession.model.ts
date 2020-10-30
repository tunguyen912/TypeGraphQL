import  { IUserPayload } from './IUserPayload.model'

export interface ISession extends Express.Session {
    user?: IUserPayload
}